#!/usr/bin/env python3
"""ax.py -- read the phone's screen as NAMED ELEMENTS instead of pixels.

  ax.py list                 every focusable element, in layout order, as JSON
  ax.py find <substring>     the first element whose caption contains <substring>

WHY THIS EXISTS. Every other way this harness has of knowing what is on screen goes through
a screenshot: measure a control by eye, tap a coordinate, then judge the result by diffing
greyscale pixels. That is fragile in a way that bites silently. Measured 2026-07-30 inside
one session: the Govee app's promo banner disappeared between two steps, every tile moved up
145 small-screenshot pixels, and coordinates read off the earlier shot pointed at nothing.

This reads the accessibility tree instead, so a control is identified by NAME, and its state
comes back with it: the same power button reads "control btn home off, Button, Selected"
while the light is on and "control btn home off, Button" once it is off. That makes it a
real oracle for "did the thing I meant actually change", which a pixel diff never was.

THIS TOOL DOES NOT TAP, AND THAT IS NOT AN OVERSIGHT. The daemon exposes
`deviceElement:performAction:withValue:`, and every element advertises AXAction-2010
("Activate") with PerformsActionValue_v1 true, so pressing LOOKS available. It is not, for a
third-party app: upstream documents `task_for_pid-allow` as the requirement, and against the
App Store Govee build it is a SILENT no-op. Measured 2026-07-30 against the cupboard H617A,
judged on the wire rather than on screen, with a pixel tap passing on both sides of it:

  pixel tap before        33 01 01, light on
  perform_press           returns without raising, 0 BLE frames
  perform_press again     enumerated and pressed on ONE monitored session, with app
                          monitoring on, so an unresolved stale handle cannot explain it.
                          Returns without raising, 0 BLE frames
  pixel tap after         33 01 00, light off, so the control was live throughout

Two other routes to a tap were tried in the same session and both failed. The inspector
overlay (`deviceInspectorShowVisuals:`) draws nothing a screenshot can see, so geometry
cannot be recovered that way. Audits DO return real rects, accurately -- one came back as
{{143.67, 315.67}, {39, 39}}, whose centre is small-screenshot (171.3, 352.0) against the
(171, 351) that was tapped by hand -- but audits only report elements that FAIL a check, so
that is a partial map with mostly missing names, not a name-to-rect function. There is no
frame on the focus payload at all: its four keys are CaptionTextValue_v1,
SpokenDescriptionValue_v1, ElementValue_v1 and InspectorSectionsValue_v1, and the last holds
attribute DESCRIPTORS, not values.

So: taps still go through act.sh and the gesture space. Do not re-try pressing from here.

TRANSPORT. This must run over a plain usbmux lockdown client. Over an RSD provider --
kernel tunneld OR the userspace CoreDeviceProxy tunnel -- AccessibilityAudit switches to
RSD_SERVICE_NAME, the "...axAuditDaemon.remoteserver.shim.remote" variant, whose channel
opens, accepts deviceInspectorMoveWithOptions without complaint, and then publishes NO focus
events at all. That is indistinguishable from an app with no accessible elements, and it
cost three failed runs to tell apart from a bug in this file. Measured, same phone, minutes
apart: tunneld 0 elements, userspace tunnel 0 elements, usbmux 20 elements.

The upside is real: like BTPacketLogger, this needs NO TUNNEL AND NO ROOT, so reading the
screen does not depend on the app-driving half of the rig being up.

Run it through the pymobiledevice3 tool interpreter, not the project venv; pymobiledevice3
is a uv tool and is deliberately not a dependency of this repo. phone.sh's `ax` does that.
"""

from __future__ import annotations

import asyncio
import json
import sys
from typing import Any


def _describe(element: Any) -> dict[str, Any]:
    """Flatten one focus event into the fields worth acting on.

    `platform_identifier` is a memory address. It is stable enough to press or re-reference
    within one app session, and meaningless across an app restart, so callers should match
    on the caption and treat the identifier as a within-session handle only.
    """
    return {
        "caption": element.caption,
        "spoken_description": element.spoken_description,
        "platform_identifier": element.platform_identifier,
    }


def select(elements: list[dict[str, Any]], needle: str) -> dict[str, Any] | None:
    """First element whose caption contains `needle`, in focus-walk order.

    Substring, never equality: a caption carries state as well as identity, so the power
    button that reads "control btn home off, Button, Selected" while lit reads
    "control btn home off, Button" once off, and an exact match silently finds nothing at
    the moment the state flips. Walk order follows layout order, so "first match" is the
    topmost, leftmost one, which is what a human means by "the first tile".
    """
    for element in elements:
        if needle in (element.get("caption") or ""):
            return element
    return None


async def _walk() -> list[dict[str, Any]]:
    # Imported here, not at module scope, so the argument handling above stays importable
    # (and testable) on a machine without pymobiledevice3, which the project venv is.
    from pymobiledevice3.lockdown import create_using_usbmux
    from pymobiledevice3.services.accessibilityaudit import AccessibilityAudit

    elements: list[dict[str, Any]] = []
    async with AccessibilityAudit(await create_using_usbmux()) as service:
        async for element in service.iter_elements():
            elements.append(_describe(element))
    return elements


def main(argv: list[str]) -> int:
    if len(argv) < 2 or argv[1] not in ("list", "find"):
        print(__doc__, file=sys.stderr)
        return 2
    if argv[1] == "find" and len(argv) < 3:
        print("find needs a caption substring", file=sys.stderr)
        return 2

    elements = asyncio.run(_walk())
    if argv[1] == "list":
        print(json.dumps(elements, indent=2))
        return 0

    match = select(elements, argv[2])
    if match is None:
        # Loud, and it names the alternatives: a silent miss here would be read as "the
        # control is gone" when the caption has merely picked up a state suffix.
        print(f"no element captioned like {argv[2]!r}. Present:", file=sys.stderr)
        for element in elements:
            print(f"  {element['caption']}", file=sys.stderr)
        return 1
    print(json.dumps(match, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
