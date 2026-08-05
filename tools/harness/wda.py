"""Drive the phone by element NAME through WebDriverAgent. No coordinates, ever.

WHY NOT COORDINATES. `ax.py` reads the screen by name but cannot press: the accessibility
daemon's `perform_press` is a silent no-op against a third-party app. The pixel path can press
but its coordinates go stale without warning; a promotional banner appeared mid-session once
and moved every tile 145 pixels. So actuation goes through XCUITest, and the screen is
addressed by what things are CALLED rather than where they were last seen.

THE RULE THAT MAKES THIS WORK: act only on a name that is UNIQUE on the current screen.

Govee's device list defeats a naive version of that. Every tile's power button is called
`control btn home off`, all three share one flat parent so there is no per-device subtree to
scope to, and WDA's find-element returns the first DOCUMENT-order match, which on the observed
tree is the top-right tile rather than the top-left. A probe that asked for a power button by
name got the offline device and put nothing on the wire.

The fix is not to guess which one by position. It is to navigate somewhere the name is not
ambiguous: device NAMES are unique, so opening a device's own page gives a screen whose
controls belong to one device. That generalises, and it does not encode this app's layout.

`unique()` refuses an ambiguous name rather than picking one, because picking is exactly the
silent wrong answer that cost a session.

Every call re-reads the screen. That is affordable because `wda_daemon.py` holds one runner
alive, so a query is an HTTP round trip rather than a 60 second runner start.
"""

from __future__ import annotations

import argparse
import contextlib
import json
import os
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

from defusedxml import ElementTree

GOVEE_BUNDLE_ID = "com.ihoment.GoVeeSensor"
DEFAULT_BASE_URL = "http://127.0.0.1:8100"
# Not a settling delay: an upper bound on waiting for a NAMED element, polled by asking
# whether it is there yet. A fixed sleep is wrong in both directions, and the gap being
# covered is real. Measured on the device list: zero tiles present at t=0, three at t=2s,
# and querying inside that window returns a clean 404 that looks exactly like a bad locator.
DEFAULT_DEADLINE = 20.0


class WdaError(RuntimeError):
    pass


# Sessions outlive a single CLI call on purpose; see Screen.open. Kept beside the harness's
# other run state so `down.sh` clears it with everything else.
_SESSION_FILE = Path(os.environ.get("HARNESS_RUN_DIR") or Path(tempfile.gettempdir()) / "govee-harness") / "wda-session"


def _cached_session() -> str:
    try:
        return _SESSION_FILE.read_text().strip()
    except OSError:
        return ""


def _cache_session(session: str) -> None:
    _SESSION_FILE.parent.mkdir(parents=True, exist_ok=True)
    _SESSION_FILE.write_text(session)


class AmbiguousError(WdaError):
    """More than one element answers to that name, so acting would be a coin toss."""


class NotFoundError(WdaError):
    pass


class NotDisplayedError(WdaError):
    """In the tree, but not somewhere a click can safely be aimed.

    Raised rather than clicking anyway, because the failure mode is silent: an element whose
    accessibility frame was never resolved reports its container's origin, so the tap lands on
    an unrelated control and WDA answers success.
    """


def _request(
    base_url: str,
    method: str,
    path: str,
    payload: dict[str, Any] | None = None,
    timeout: float = 60.0,
) -> dict[str, Any]:
    body = None if payload is None else json.dumps(payload).encode()
    request = urllib.request.Request(  # noqa: S310 - fixed localhost forward
        f"{base_url}{path}",
        data=body,
        method=method,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:  # noqa: S310
            parsed: dict[str, Any] = json.loads(response.read())
            return parsed
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode(errors="replace")
        raise WdaError(f"{method} {path} -> {exc.code}: {detail[:300]}") from exc
    except urllib.error.URLError as exc:
        raise WdaError(f"{method} {path} -> {exc.reason}. Is wda_daemon.py up?") from exc


def elements(source: str) -> list[dict[str, Any]]:
    """Every element on screen, named or not, with the state needed to explain a dead tap.

    Unnamed elements are INCLUDED. They were filtered out at first, which hid the colour
    swatches, their enclosing collection view and the add-colour button, and made a screen
    that plainly had controls on it look empty. An element with no name cannot be tapped by
    name, but that is a reason to reach for `tap_chain`, not a reason to pretend it is absent.

    `visible` is the AND of TWO tests, because each catches a fault the other misses, and
    dropping either one has already cost a session.

    WDA's own flag catches elements whose FRAME IS NOT RESOLVED. The Workshop brightness
    sub-panel is a pager nested inside a pager, and iOS gives its children the enclosing
    cell's origin with their own size, so `Brightest-Darkest` reports (0, 202, 108, 17) while
    rendering near the bottom of the form. WDA is not lying: `/element/{id}/rect` and
    `/element/{id}/displayed` say exactly the same thing, freshly, and mark it not displayed.
    A click on such an element lands at that bogus midpoint, which sits over an unrelated row,
    so the tap SILENTLY ACTUATES THE WRONG CONTROL. Asking for Brightness Order opened Select
    Type. Nothing about the response distinguishes that from success.

    The bounds test catches the opposite fault, where the frame is resolved and WDA still
    calls it visible: the Workshop layer panels are a horizontal pager and the previously
    selected panel is parked at a negative x, duplicating every control on the live one.

    An earlier version of this file used the bounds test ALONE, on the strength of one reading
    where the navigation bar's back button reported `visible="false"`. That reading was a
    transient during a screen transition, not a property of the app: the same button reports
    visible a moment later. Weakening the test to accommodate it is what let the unresolved
    frames through and produced the misclicks. Transients are handled by WAITING for an
    element to become usable, in `await_usable`, not by lowering the bar for what usable means.
    """
    root = ElementTree.fromstring(source)
    bounds = _rect_of(root)
    found = []
    for element in root.iter():
        rect = (element.get("x"), element.get("y"), element.get("width"), element.get("height"))
        onscreen = _intersects(rect, bounds)
        wda_visible = element.get("visible") == "true"
        found.append(
            {
                "type": element.tag,
                "name": element.get("name"),
                "label": element.get("label"),
                "value": element.get("value"),
                "enabled": element.get("enabled") == "true",
                "visible": wda_visible and onscreen,
                "wda_visible": wda_visible,
                "onscreen": onscreen,
                # Kept ONLY to answer "are these two entries the same control?", never to
                # decide where to tap. See unique(): the tree duplicates some controls
                # verbatim, and without this they read as a genuine ambiguity and block the
                # tap.
                "rect": rect,
            }
        )
    return found


def _rect_of(element: Any) -> tuple[int, int, int, int] | None:
    try:
        return (int(element.get("x")), int(element.get("y")), int(element.get("width")), int(element.get("height")))
    except TypeError, ValueError:
        return None


def _intersects(rect: tuple[str | None, ...], bounds: tuple[int, int, int, int] | None) -> bool:
    if bounds is None:
        return True
    try:
        x, y, w, h = (int(v) for v in rect)  # type: ignore[arg-type]
    except TypeError, ValueError:
        return True
    bx, by, bw, bh = bounds
    return x + w > bx and x < bx + bw and y + h > by and y < by + bh


def named(source: str) -> list[dict[str, Any]]:
    return [element for element in elements(source) if element["name"]]


def matching(source: str, name: str) -> list[dict[str, Any]]:
    return [element for element in elements(source) if element["name"] == name]


# Types that DO something when tapped. iOS routinely gives a button and its visible label the
# same accessible name, so a name can match two elements of which only one is an actuator.
# Preferring the actionable one is disambiguation by KIND, which is stable, unlike preferring
# one by position, which is the coordinate dependence this module exists to avoid.
ACTIONABLE = frozenset(
    {
        "XCUIElementTypeButton",
        "XCUIElementTypeCell",
        "XCUIElementTypeSwitch",
        "XCUIElementTypeSlider",
        "XCUIElementTypeTextField",
        "XCUIElementTypeSecureTextField",
        "XCUIElementTypeLink",
        "XCUIElementTypeMenuItem",
        "XCUIElementTypeSegmentedControl",
    }
)


def _mid_y(element: dict[str, Any]) -> float:
    """Vertical centre of an element, for asking which controls share a row.

    Used only to relate elements read from the SAME snapshot to each other. Nothing here is
    remembered between calls, which is the difference between this and a stored coordinate.
    """
    try:
        return int(element["rect"][1]) + int(element["rect"][3]) / 2
    except TypeError, ValueError:
        return float("inf")


def _overlaps_x(element: dict[str, Any], other: dict[str, Any]) -> bool:
    """Whether two elements share any horizontal span, for pairing within a grid column."""
    try:
        ax, aw = int(element["rect"][0]), int(element["rect"][2])
        bx, bw = int(other["rect"][0]), int(other["rect"][2])
    except TypeError, ValueError:
        return False
    return ax < bx + bw and bx < ax + aw


def unique(source: str, name: str) -> dict[str, Any]:
    """The one element called `name`, or an error naming which failure it was.

    Ambiguity between two DIFFERENT controls is an error and never a choice: WDA would
    silently return the first document-order match, which is not the visually first, and that
    is how a press landed on an offline device and reported success.

    Ambiguity between a control and its own label is not that. `Apply` matches both the button
    and the static text sitting on it, and only one of them does anything, so the actionable
    one is taken.
    """
    found = matching(source, name)
    if not found:
        # Near-misses, because the failure that costs a round trip is a name that LOOKS
        # right. Govee's scene tiles are called "Green\xa0Reign" with a non-breaking space,
        # which is indistinguishable from an ordinary one in a terminal and in a diff, so
        # "nothing on screen is called that" reads as the wrong screen rather than as the
        # wrong space. Matching stays exact; only the error message is forgiving.
        squashed = " ".join(name.split()).casefold()
        close = sorted({e["name"] for e in named(source) if " ".join(e["name"].split()).casefold() == squashed})
        if close:
            raise NotFoundError(
                f"nothing on screen is called {name!r}, but {', '.join(repr(c) for c in close)} "
                f"differs from it only in whitespace or case. Use the exact name."
            )
        raise NotFoundError(f"nothing on screen is called {name!r}")
    if len(found) > 1:
        # Narrow by KIND first, then by whether it is actually on screen. Both are functional
        # properties of the element: an invisible control cannot be tapped, and a label is not
        # an actuator. Neither is a guess about where things sit, which is the thing this
        # module refuses to depend on.
        candidates = [e for e in found if e["type"] in ACTIONABLE] or found
        if len(candidates) > 1:
            candidates = [e for e in candidates if e["visible"]] or candidates
        if len(candidates) > 1:
            # WDA's own flag, last and only among candidates already known to be on screen.
            # It is wrong in both directions on this app, so it cannot be trusted to EXCLUDE
            # anything, but among things that are genuinely on screen it still tends to pick
            # out the one iOS considers hittable.
            candidates = [e for e in candidates if e["wda_visible"]] or candidates
        if len(candidates) > 1:
            # The tree lists some controls twice, verbatim: the Workshop layer tabs each
            # appear as two entries with the same type, state and rect. Those are ONE control
            # seen twice, not a choice, and refusing them blocks a tap that is unambiguous in
            # every sense that matters. Geometry is used here to ask whether two entries are
            # the same element, never to decide where to tap.
            distinct = {(e["type"], e["rect"], e["enabled"], e["visible"]) for e in candidates}
            if len(distinct) == 1:
                return candidates[0]
        if len(candidates) == 1:
            return candidates[0]
        states = ", ".join(f"{e['type']} enabled={e['enabled']} visible={e['visible']}" for e in found)
        raise AmbiguousError(
            f"{len(found)} elements are called {name!r} ({states}). "
            f"Navigate somewhere it is unique instead of guessing between them."
        )
    return found[0]


def pair(source: str, name: str, anchor: str, where: str = "row") -> dict[str, Any]:
    """The element called `name` that belongs to the item or section labelled `anchor`.

    Repeated controls are the normal case in this app, not the exception: every collapsible
    section carries an identically named fold button, and every tile in the Workshop grid
    carries an identically named edit badge, so `unique()` rightly refuses to guess between
    them. Navigating somewhere the name is unique is the usual answer and there is nowhere to
    navigate to, because the repeats share one screen.

    The answer that does not reintroduce stored coordinates is to pair the control with a
    LABEL, using each one's live rect only to ask which of them BELONG together. That is the
    same use of geometry `unique()` already makes: a question about the relationship between
    two elements read in the same snapshot, never a remembered place to aim at.

    `where` is the caller's, because the app uses two different conventions and no single rule
    serves both. A form header sits BESIDE its control, so `row` is right there. A grid tile's
    caption sits BELOW the tile, so its edit badge is `above`. Inferring this from "nearest"
    quietly picked the badge of the tile in the NEXT ROW and opened the wrong Workshop item,
    which looked like a successful tap. Making the relationship an argument turns that from a
    hidden heuristic into a stated assumption.

    Candidates are narrowed to the anchor's own column first, which is what separates one grid
    tile from its neighbour. Ties are refused rather than broken.
    """
    if where not in ("row", "above", "below"):
        raise ValueError(f"where must be row, above or below, not {where!r}")
    anchor_element = unique(source, anchor)
    siblings = [e for e in elements(source) if e["name"] == name]
    if not siblings:
        raise NotFoundError(f"nothing called {name!r} to pair with {anchor!r}")
    aligned = [e for e in siblings if _overlaps_x(e, anchor_element)]
    candidates = aligned or siblings
    anchor_mid = _mid_y(anchor_element)
    if where == "above":
        candidates = [e for e in candidates if _mid_y(e) < anchor_mid]
    elif where == "below":
        candidates = [e for e in candidates if _mid_y(e) > anchor_mid]
    if not candidates:
        raise NotFoundError(f"no element called {name!r} sits {where} {anchor!r}")
    scored = sorted((abs(_mid_y(e) - anchor_mid), i, e) for i, e in enumerate(candidates))
    if len(scored) > 1 and scored[0][0] == scored[1][0]:
        raise AmbiguousError(
            f"{len(scored)} elements called {name!r} are equally close to {anchor!r}; refusing to guess"
        )
    return scored[0][2]


class Screen:
    """A live connection to whatever the phone is showing."""

    def __init__(self, base_url: str = DEFAULT_BASE_URL) -> None:
        self.base_url = base_url
        self.session: str = ""

    def open(self, bundle_id: str = GOVEE_BUNDLE_ID) -> Screen:
        """Attach to the app, REUSING an existing session where one is still alive.

        Creating a session with a bundle id activates that app, which resets it to its root
        screen. Doing that per command makes multi-step navigation impossible: every call
        undoes the previous one's navigation, and the screen appears frozen on the first page
        no matter what is tapped. So the session id is cached on disk and only replaced when
        the phone says it is gone.
        """
        cached = _cached_session()
        if cached and self._session_alive(cached):
            self.session = cached
            return self
        response = _request(
            self.base_url,
            "POST",
            "/session",
            {
                "capabilities": {"alwaysMatch": {"bundleId": bundle_id}},
                "desiredCapabilities": {"bundleId": bundle_id},
            },
        )
        session = response.get("sessionId") or (response.get("value") or {}).get("sessionId")
        if not session:
            raise WdaError("WDA did not return a session id")
        self.session = session
        _cache_session(session)
        return self

    def _session_alive(self, session: str) -> bool:
        try:
            _request(self.base_url, "GET", f"/session/{session}/source", timeout=20.0)
        except WdaError:
            return False
        return True

    def source(self) -> str:
        value = _request(self.base_url, "GET", f"/session/{self.session}/source").get("value")
        if not isinstance(value, str):
            raise WdaError("WDA did not return a source string")
        return value

    def await_name(self, name: str, deadline: float = DEFAULT_DEADLINE) -> str:
        """Return the source once `name` is on screen. Polls for the THING, not the clock."""
        expiry = time.monotonic() + deadline
        while True:
            source = self.source()
            if matching(source, name):
                return source
            if time.monotonic() >= expiry:
                raise NotFoundError(f"{name!r} did not appear within {deadline}s")
            time.sleep(0.3)

    def await_usable(self, name: str, deadline: float = DEFAULT_DEADLINE) -> tuple[str, dict[str, Any]]:
        """Wait until `name` is not merely PRESENT but usable, and return it with its source.

        Presence and usability are different questions and conflating them caused two separate
        faults. An element can be in the tree while its frame is still the previous screen's,
        during a transition, which is why the navigation bar's back button read as invisible
        for one poll and visible immediately after. Waiting for it costs a second; concluding
        the flag is unreliable and clicking anyway cost a wrong control being actuated.
        """
        expiry = time.monotonic() + deadline
        last: dict[str, Any] | None = None
        while True:
            source = self.source()
            candidates = matching(source, name)
            if candidates:
                try:
                    element = unique(source, name)
                except AmbiguousError:
                    raise
                if element["visible"]:
                    return source, element
                last = element
            if time.monotonic() >= expiry:
                if last is None:
                    raise NotFoundError(f"{name!r} did not appear within {deadline}s")
                return self.source(), last
            time.sleep(0.3)

    def scroll_to(self, name: str, *, attempts: int = 5) -> dict[str, Any]:
        """Scroll the form until the named element is on screen, then return it.

        The layer editor is a long form: most of its controls exist in the tree with
        `visible=false` because they are below the fold. They cannot be tapped in that state,
        and the failure does not look like a scrolling problem, it looks like a control that
        will not respond.

        WDA's own `toVisible` scroll REFUSES on this app, reporting "Failed to find scrollable
        visible parent", because the layer panels are not a scroll view it recognises. So the
        enclosing table is driven by direction and the tree re-read after each page, which
        needs no offset, no distance and no coordinate.

        BOTH DIRECTIONS. An earlier version only ever scrolled down, so a control ABOVE the
        current position reported "never became visible", which reads as a missing control and
        is really a search that refused to turn around. It cost a wrong conclusion about the
        Brightness section. The element's own rect steers which way to try first, which is
        reading the layout to direct a search rather than aiming at a remembered pixel.

        A DIRECTION IS ABANDONED AS SOON AS IT STOPS MOVING. Every attempt costs a scroll and
        a full tree read, so a blind sweep in both directions is not a small price: it turned
        a failed lookup from seconds into minutes, and a harness that takes minutes to fail is
        one nobody waits for. When the target's rect stops changing the form has hit its end,
        and continuing to scroll that way cannot help.
        """
        for direction in self._search_directions(name):
            previous: tuple[str | None, ...] | None = None
            for _ in range(attempts):
                candidates = matching(self.source(), name)
                found = [e for e in candidates if e["visible"]]
                if found:
                    return found[0]
                here = candidates[0]["rect"] if candidates else None
                if here is not None and here == previous:
                    break
                previous = here
                self.scroll_form(direction)
        raise NotFoundError(f"{name!r} never became visible after scrolling both ways")

    def _search_directions(self, name: str) -> list[str]:
        """Which way the target lies, preferring the direction its own rect implies."""
        candidates = matching(self.source(), name)
        tops = [int(e["rect"][1]) for e in candidates if str(e["rect"][1]).lstrip("-").isdigit()]
        if tops and min(tops, key=abs) < 0:
            return ["up", "down"]
        return ["down", "up"]

    def reveal(self, name: str, *, attempts: int = 8) -> dict[str, Any]:
        return self.scroll_to(name, attempts=attempts)

    def tap(self, name: str, deadline: float = DEFAULT_DEADLINE) -> dict[str, Any]:
        """Tap the uniquely named element. Refuses a genuinely ambiguous name.

        Refuses, too, to click anything WDA does not report as displayed, even after
        scrolling. That is not caution for its own sake: an element whose accessibility frame
        was never resolved reports its container's origin, and clicking it lands on whatever
        occupies that origin instead. In this app that turned "open Brightness Order" into
        "open Select Type", with a success response and no way to tell from the reply. A loud
        refusal is the only safe behaviour, because the alternative is a probe that reports a
        parameter it never set.
        """
        source, element = self.await_usable(name, deadline)
        if not element["visible"]:
            # Below the fold rather than absent. Scrolling is the app's own, so this stays
            # correct when the form is re-laid out. A scroll that never reveals it does NOT
            # mean the control is missing: it is in the tree, it simply has no frame a click
            # can be aimed at, and saying "not found" for something plainly on screen sends
            # the reader looking for the wrong fault.
            try:
                self.scroll_to(name)
            except NotFoundError:
                pass
            source = self.source()
            element = unique(source, name)
        if not element["enabled"]:
            raise WdaError(f"{name!r} is on screen but disabled, so tapping it does nothing")
        if not element["visible"]:
            raise NotDisplayedError(
                f"{name!r} is in the tree at {element['rect']} but WDA does not report it "
                f"displayed (wda_visible={element['wda_visible']}, onscreen={element['onscreen']}). "
                f"Clicking it would tap that rect and hit whatever is really there. "
                f"Reach it another way, or drive the control that owns it."
            )
        self._click_element(source, element, name)
        return element

    def _click_element(self, source: str, element: dict[str, Any], name: str) -> None:
        """Click the element THIS module chose, not whichever one WDA would pick for a name.

        A predicate handed to WDA returns its first document-order match, so every decision
        `unique()` made is thrown away the moment the tap is issued. That is not hypothetical:
        the parked layer panel duplicates every control, WDA calls it `visible`, and it comes
        first in document order, so a name resolved correctly here was still tapped on the
        wrong panel. Addressing the element by its INDEX among same-named siblings of the same
        type, computed from the same snapshot the decision came from, keeps the two in step.
        """
        siblings = [e for e in elements(source) if e["name"] == name and e["type"] == element["type"]]
        index = siblings.index(element) + 1 if element in siblings else 1
        self._click(f'**/{element["type"]}[`name == "{name}"`][{index}]')

    def frontmost(self) -> str | None:
        """The application element's name, so a caller can tell WHICH app it is driving."""
        root = ElementTree.fromstring(self.source())
        app = next((e for e in root.iter() if e.tag == "XCUIElementTypeApplication"), None)
        return app.get("name") if app is not None else None

    def require_app(self, expected: str = "Govee Home") -> None:
        """Fail loudly if the phone is no longer showing the app being driven.

        A class-chain tap that misses can land on something that switches app entirely: one
        did, and opened a camera's live view. Everything after that point reads a foreign
        element tree, and the taps that follow are not merely useless, they are being
        delivered to somebody else's UI.
        """
        actual = self.frontmost()
        if actual != expected:
            raise WdaError(f"expected to be driving {expected!r} but the frontmost app is {actual!r}")

    def type_text(self, text: str) -> None:
        """Type into the focused field, for dialogs that demand a value before proceeding.

        Saving a Workshop item opens a name prompt whose Confirm stays disabled until the
        field has content, so without this the save cannot complete at all.
        """
        _request(self.base_url, "POST", f"/session/{self.session}/wda/keys", {"value": list(text)})

    def scroll_form(self, direction: str = "down", container: str | None = None) -> None:
        """Scroll the enclosing form by one page.

        WDA's `toVisible` scroll refuses on this app: it reports "Failed to find scrollable
        visible parent", because the layer panels are not a scroll view it recognises. Driving
        a container by DIRECTION works and is still structural, naming a container type rather
        than a pixel to drag from.

        WHICH container is not fixed, and assuming it was is what made this fail. It named
        XCUIElementTypeTable outright, which the layer editor has and the device page does
        not: every lookup that needed a scroll there died on a raw 404 for a class chain,
        which reads as WDA being broken rather than as this function looking for furniture
        that screen does not have. The candidates are tried in the order that puts the most
        specific first, and only ones actually present are attempted.

        The last resort is a swipe up the middle of the screen, which needs no container at
        all. It is a coordinate, so it is genuinely last, but it is a coordinate in the one
        place every scrollable view in this app occupies, and a scroll that lands slightly
        wrong is self-correcting because the caller re-reads the tree and scrolls again.
        """
        candidates = (
            [container]
            if container
            else ["XCUIElementTypeTable", "XCUIElementTypeCollectionView", "XCUIElementTypeScrollView"]
        )
        present = {e["type"] for e in elements(self.source())}
        for kind in candidates:
            if kind not in present:
                continue
            with contextlib.suppress(WdaError):
                _request(
                    self.base_url,
                    "POST",
                    f"/session/{self.session}/wda/element/{self._element_id(f'**/{kind}')}/scroll",
                    {"direction": direction},
                )
                time.sleep(0.6)
                return
        window = self._window()
        mid, near, far = window["width"] // 2, window["height"] * 3 // 4, window["height"] // 4
        self.swipe(mid, near, mid, far) if direction == "down" else self.swipe(mid, far, mid, near)
        time.sleep(0.6)

    def _window(self) -> dict[str, int]:
        """The application element's own rect, so the swipe fallback needs no fixed numbers."""
        root = ElementTree.fromstring(self.source())
        app = next((e for e in root.iter() if e.tag == "XCUIElementTypeApplication"), None)
        if app is None:
            raise WdaError("WDA returned a tree with no application element")
        return {"width": int(app.get("width") or 0), "height": int(app.get("height") or 0)}

    def pick(self, value: str, wheel: int = 0) -> str:
        """Set an on-screen picker wheel to `value` by NAME, not by swiping to it.

        Govee puts several numeric parameters behind a modal wheel: Minimum IC, Maximum ICs,
        Number of IC. A wheel is the worst possible target for a gesture, because the value
        it lands on depends on inertia, so a swipe-based harness has to look at the screen
        afterwards to find out what it actually chose.

        `XCUIElementTypePickerWheel` accepts a value directly, which is both exact and
        name-based, and reading the wheel's own `value` back afterwards confirms the set
        rather than assuming it. Raises if the wheel did not take the value, because a
        silently ignored set is how a probe ends up reporting a parameter it never applied.

        `wheel` selects which one, because a modal can hold more than a single wheel: the
        timer's "Set time" carries hours and minutes side by side, and addressing only the
        first would set an hour and leave the minutes to whatever they already read, which
        is exactly the silent half-application the read-back above exists to prevent.
        """
        element_id = self._element_id(f"**/XCUIElementTypePickerWheel[{wheel + 1}]")
        _request(
            self.base_url,
            "POST",
            f"/session/{self.session}/element/{element_id}/value",
            {"value": [value]},
        )
        time.sleep(0.4)
        wheels = [e for e in elements(self.source()) if e["type"] == "XCUIElementTypePickerWheel"]
        if wheel >= len(wheels):
            raise WdaError(f"picker wheel {wheel} does not exist; the screen has {len(wheels)}")
        landed = wheels[wheel]["value"]
        if str(landed) != value:
            raise WdaError(f"picker wheel {wheel} would not take {value!r}; it reads {landed!r}")
        return value

    def slide(self, name: str, to: float, start: float = 0.5) -> dict[str, Any]:
        """Drag along a named element's rect, addressed as a FRACTION of its width.

        A slider is the one control a name alone cannot drive: the name says which slider,
        the fraction says where along it. Everything else here is named because pixels go
        stale; a fraction of a named element's own rect does not, so this keeps the rule.

        NAME THE ELEMENT THAT SPANS THE TRACK, NOT THE THUMB. Govee draws the thumb as an
        XCUIElementTypeImage whose rect is the thumb alone, so a drag "along" it travels a
        few points. On the video Relative Brightness sheet the element that spans the track
        is the percentage label, so `slide '50%' 0.9` is the call that works. That is also
        why this accepts any named element rather than a slider type: what is needed is
        something whose rect IS the range, and the app does not promise that is the control.

        WHY W3C ACTIONS AND NOT THE HID PATH. `phone.sh` can already drag by screen pixel
        through serve-web's /touch, and on 2026-08-04 that path stopped delivering: the same
        drag on the same slider moved nothing and put nothing on the wire, while this one
        moved it 50% -> 100% and produced the 33 ae write that named the register. /touch
        answers 200 either way, because a 200 means the report was dispatched and not that
        backboardd honoured it, so the failure is silent. Prefer this.

        Judgement is left to the caller: `act.sh` already decides delivery from the screen
        diff and the BLE that follows, and a read-back here could not use the element's name
        anyway - the label this is aimed at is CALLED '50%' and stops existing on success.

        The label is the track only APPROXIMATELY. On the Relative Brightness sheet the real
        track is (51,551,300,35) and the label (83,552,300,33): same width, origin 32 points
        right, so a fraction of the label runs long and settings above about 0.85 clamp to
        full. That is tolerable for isolating a register, where what matters is that two
        writes differ, and it is recorded here so nobody reads a fraction as a percentage.
        """
        _, element = self.await_usable(name)
        if not element["visible"]:
            raise NotDisplayedError(f"{name!r} is in the tree at {element['rect']} but is not displayed")
        x, y, width, height = (int(value) for value in element["rect"])
        if width < 2:
            raise WdaError(f"{name!r} is {width} points wide; name the track, not the thumb")
        origin, target, midline = x + round(width * start), x + round(width * to), y + height // 2
        self.swipe(origin, midline, target, midline)
        return {"rect": (str(x), str(y), str(width), str(height)), "from": origin, "to": target}

    def swipe(self, x1: int, y1: int, x2: int, y2: int) -> None:
        """Drag between two absolute coordinates, in WDA POINTS.

        The primitive `slide` is built on, exposed because two things need it that no name
        can express. Sliders whose track is UNNAMED: the video Sound Effects "Softness"
        control is an unnamed element at (31,746,334,35) whose only named neighbour is the
        caption above it, so a drag along the name travels the wrong row. And SCROLLING,
        which this module otherwise only does as a side effect of reaching for a name - the
        video page's second toggle sat at y=904 on an 874-point screen, and a tap aimed at
        its rect landed off the screen and reported nothing wrong.
        """
        moves = [
            {
                "type": "pointerMove",
                "duration": 40,
                "x": int(x1 + round((x2 - x1) * step / 12)),
                "y": int(y1 + round((y2 - y1) * step / 12)),
            }
            for step in range(1, 13)
        ]
        self._actions(
            [{"type": "pointerMove", "duration": 0, "x": int(x1), "y": int(y1)}, {"type": "pointerDown", "button": 0}]
            # Held either side of the movement because a drag with no dwell reads as a flick:
            # the control takes the gesture as a scroll of whatever is underneath it.
            + [{"type": "pause", "duration": 200}]
            + moves
            + [{"type": "pause", "duration": 200}, {"type": "pointerUp", "button": 0}]
        )

    def point(self, x: int, y: int) -> None:
        """Tap one absolute coordinate, in WDA POINTS, for controls a name cannot single out.

        The last resort, and deliberately not the first: it is the coordinate dependence this
        module exists to avoid. It earns its place because names in this app are repeated far
        more often than they are unique - the video sheet carries four identical edge
        checkboxes called `new light btn 7022 unchoose da` and two toggles called
        `light btn mode off` - and `unique()` is right to refuse those. When only POSITION
        distinguishes two controls, position is the honest way to choose between them.

        Read the coordinate off the element's own rect from `find`, not off a screenshot.
        WDA points are 402x874 on this phone while the small screenshot is 422x917, so the
        two differ by about 5% and a screenshot pixel used here lands low and right.

        This is NOT the serve-web /touch path, which on 2026-08-04 answered 200 while
        delivering nothing.
        """
        self._actions(
            [
                {"type": "pointerMove", "duration": 0, "x": int(x), "y": int(y)},
                {"type": "pointerDown", "button": 0},
                {"type": "pause", "duration": 120},
                {"type": "pointerUp", "button": 0},
            ]
        )

    def _actions(self, steps: list[dict[str, Any]]) -> None:
        _request(
            self.base_url,
            "POST",
            f"/session/{self.session}/actions",
            {
                "actions": [
                    {"type": "pointer", "id": "finger1", "parameters": {"pointerType": "touch"}, "actions": steps}
                ]
            },
            timeout=30.0,
        )

    def tap_beside(self, name: str, anchor: str, where: str = "row") -> dict[str, Any]:
        """Tap the element called `name` that belongs to the item or section labelled `anchor`."""
        source = self.source()
        chosen = pair(source, name, anchor, where)
        self._click_element(source, chosen, name)
        return chosen

    def tap_chain(self, chain: str, *, scroll: bool = True) -> None:
        """Tap by class chain, for controls that carry NO name at all.

        The colour swatches in the Workshop palette are `XCUIElementTypeCell` with a null
        name, inside a collection view, so no amount of navigating makes them addressable by
        name. The honest fallback is STRUCTURAL: position within a typed container, as in

            **/XCUIElementTypeCollectionView/XCUIElementTypeCell[1]

        That is not the coordinate dependence this module avoids. A pixel is a measurement of
        one layout at one moment and goes stale silently; an index into a collection is part
        of the view hierarchy and survives the strip being re-laid out, the phone rotating, or
        a banner appearing. It does assume the collection's ORDER is stable, which is a much
        weaker assumption than assuming its geometry is, but it is still an assumption: say
        which item was chosen in the evidence, and confirm the effect on the wire.

        Does NOT scroll: WDA's `toVisible` refuses on this app, so a chain target must already
        be on screen. Use `scroll_to` on a nearby named control first when it is not.

        Goes through the same displayed check as every other click, so a chain that resolves to
        an element with an unresolved frame REFUSES instead of tapping an unrelated control.
        """
        self._click(chain)

    def _element_id(self, chain: str) -> str:
        found = _request(
            self.base_url,
            "POST",
            f"/session/{self.session}/element",
            {"using": "class chain", "value": chain},
        )
        value = found.get("value") or {}
        element_id = value.get("ELEMENT") or value.get("element-6066-11e4-a52e-4f735466cecf")
        if not element_id:
            raise WdaError(f"WDA found no element id for {chain!r}")
        return str(element_id)

    def _click(self, chain: str) -> None:
        """Resolve, CHECK, then click. Every click path in this module goes through here.

        The check is a per-element `displayed` query rather than a reading from the bulk
        source, so it reflects what WDA will actually aim at, taken immediately before it aims.
        It exists because a click on an element with an unresolved accessibility frame lands on
        whatever occupies the origin it falsely reports, and answers success either way.
        """
        element_id = self._element_id(chain)
        displayed = _request(self.base_url, "GET", f"/session/{self.session}/element/{element_id}/displayed")
        if displayed.get("value") is False:
            rect = _request(self.base_url, "GET", f"/session/{self.session}/element/{element_id}/rect").get("value")
            raise NotDisplayedError(
                f"WDA resolved {chain} but does not report it displayed; it places it at {rect}. "
                f"Clicking would tap that rect and actuate whatever is really there."
            )
        _request(self.base_url, "POST", f"/session/{self.session}/element/{element_id}/click", {})

    def screenshot(self, path: str) -> str:
        """Grab a screenshot over the SAME fast connection, for catching transient UI.

        The app reports refusals as a toast that lives about a second and appears in NO
        element tree, WDA's or the accessibility daemon's: "Please select the color of the 1
        layer" was invisible to both while it was the entire reason a tap did nothing. A
        `dvt screenshot` costs a couple of seconds and reliably misses it. This one rides the
        already-open WDA connection, so it can be fired immediately after a tap.
        """
        import base64

        value = _request(self.base_url, "GET", f"/session/{self.session}/screenshot").get("value")
        if not isinstance(value, str):
            raise WdaError("WDA did not return a screenshot")
        Path(path).write_bytes(base64.b64decode(value))
        return path


def _main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "command", choices=("list", "find", "tap", "slide", "point", "swipe", "chain", "shot", "type", "pick")
    )
    parser.add_argument("name", nargs="?")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument(
        "--to",
        type=float,
        help="where along the named element to drag to, as a fraction of its width (slide only)",
    )
    parser.add_argument(
        "--from",
        dest="start",
        type=float,
        default=0.5,
        help="where along the named element the drag starts, as a fraction of its width (slide only)",
    )
    parser.add_argument(
        "--wheel",
        type=int,
        default=0,
        help="which picker wheel to set, left to right from 0 (pick only)",
    )
    parser.add_argument(
        "--shot",
        metavar="PATH",
        help="screenshot immediately after the tap, to catch a toast that the element tree never shows",
    )
    args = parser.parse_args(argv[1:])
    if args.command in ("find", "tap", "slide", "chain", "shot", "pick") and not args.name:
        parser.error(f"{args.command} needs an argument")
    if args.command == "point" and not (args.name and len(args.name.split()) == 2):
        parser.error("point needs 'X Y' in WDA points, as one quoted argument")
    if args.command == "swipe" and not (args.name and len(args.name.split()) == 4):
        parser.error("swipe needs 'X1 Y1 X2 Y2' in WDA points, as one quoted argument")
    if args.command == "slide" and args.to is None:
        parser.error("slide needs --to, a fraction of the named element's width")

    screen = Screen(args.base_url).open()
    if args.command == "type":
        # STDIN, NEVER ARGV. The first caller for this types a Wi-Fi passphrase into the
        # device's provisioning form, and a command argument is world-readable through
        # /proc for the life of the process, so a real network's password would be exposed
        # to every account on the box. Reading the value here keeps it in a pipe.
        # Trailing newline stripped: the shell adds one and the field would receive a
        # submit that the caller did not ask for.
        screen.type_text(sys.stdin.read().rstrip("\n"))
        return 0
    if args.command == "pick":
        print(screen.pick(args.name, args.wheel))
        return 0
    if args.command == "slide":
        print(screen.slide(args.name, args.to, args.start))
        return 0
    if args.command == "point":
        screen.point(*(int(v) for v in args.name.split()))
        return 0
    if args.command == "swipe":
        screen.swipe(*(int(v) for v in args.name.split()))
        return 0
    if args.command == "list":
        # Everything, not just what is on screen. An element that is scrolled out of view is
        # still in the tree, and filtering to visible ones hid two thirds of the Finger Sketch
        # editor: six motion controls and a speed slider were present and unreported, so the
        # screen looked far poorer than it was. Visibility is shown because it decides whether
        # a control can be TAPPED, but it must not decide whether it is MENTIONED.
        for element in elements(screen.source()):
            if not element["visible"] and not element["name"]:
                continue  # an unnamed element that is also off-screen is pure structure
            mark = " " if element["visible"] else "~"
            state = "" if element["enabled"] else " DISABLED"
            label = (
                repr(element["name"])
                if element["name"]
                else f"<unnamed {element['type'].removeprefix('XCUIElementType')}>"
            )
            print(f"{mark} {element['type']:28} {label}{state}")
        return 0
    if args.command == "find":
        for element in matching(screen.source(), args.name):
            print(element)
        return 0
    if args.command == "shot":
        print(screen.screenshot(args.name))
        return 0
    if args.command == "chain":
        screen.tap_chain(args.name)
        result: dict[str, Any] | str = args.name
    else:
        result = screen.tap(args.name)
    if args.shot:
        # Fired with no sleep in between: the toast that reports a refusal lasts about a
        # second and is in no element tree, so anything slower than this misses it.
        print(screen.screenshot(args.shot))
    print(result)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(_main(sys.argv))
    except WdaError as error:
        print(error, file=sys.stderr)
        raise SystemExit(1) from error
