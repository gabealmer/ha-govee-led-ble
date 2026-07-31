from pathlib import Path

import pytest

from tools.harness.wda import AmbiguousError, NotFoundError, elements, matching, named, pair, unique

_SOURCE = (Path(__file__).parent / "fixtures" / "wda_source_device_list.xml").read_text()


def test_elements_reads_names_and_state():
    named = elements(_SOURCE)
    assert {"RGBIC Strip Lights", "H617A_5849", "DreamView T1"} <= {e["name"] for e in named}


def test_unique_resolves_a_device_name():
    """Device names are unique, which is why navigation goes through them rather than
    through the controls, whose names are shared by every tile."""
    assert unique(_SOURCE, "RGBIC Strip Lights")["type"] == "XCUIElementTypeStaticText"


def test_unique_refuses_a_shared_control_name():
    """The whole point. Every tile's power button is called `control btn home off`, and WDA
    would return the FIRST document-order match, which on this captured tree is the top-right
    tile rather than the top-left. A probe that guessed pressed an offline device, reported
    success, and put nothing on the wire.
    """
    with pytest.raises(AmbiguousError) as error:
        unique(_SOURCE, "control btn home off")
    assert "3 elements" in str(error.value)
    assert "Navigate somewhere it is unique" in str(error.value)


def test_unique_distinguishes_absent_from_ambiguous():
    """Two different faults with two different fixes, so they must not share a message."""
    with pytest.raises(NotFoundError):
        unique(_SOURCE, "no such control")


def test_document_order_is_not_layout_order():
    """Guards the assumption that makes ordinal selection unsafe.

    In this captured tree the first `control btn home off` in document order sits at x=339
    (the right column) while the visually first tile's button is at x=143. Anything that picks
    "the first match" therefore picks the wrong device, which is why selection by index or by
    position was rejected in favour of navigating to a screen where the name is unique.
    """
    from defusedxml import ElementTree

    buttons = [e for e in ElementTree.fromstring(_SOURCE).iter() if e.get("name") == "control btn home off"]
    assert [int(b.get("x")) for b in buttons] == [339, 143, 143]


def test_matching_returns_every_candidate_for_diagnosis():
    assert len(matching(_SOURCE, "control btn home off")) == 3


_WORKSHOP = (Path(__file__).parent / "fixtures" / "wda_source_workshop_layer.xml").read_text()


def test_elements_includes_unnamed_controls():
    """The add-colour button and the palette's collection view carry NO name.

    Filtering them out made a screen that plainly had controls on it look empty, and hid the
    only route to the colour swatches. An element with no name cannot be tapped BY NAME; that
    is a reason to reach for a class chain, not a reason to report it as absent.
    """
    unnamed = [e for e in elements(_WORKSHOP) if not e["name"] and e["visible"]]
    assert any(e["type"] == "XCUIElementTypeButton" for e in unnamed)


def test_named_still_filters_for_callers_that_want_names():
    assert all(e["name"] for e in named(_WORKSHOP))


_PAGER = (Path(__file__).parent / "fixtures" / "wda_source_workshop_pager.xml").read_text()


def test_parked_pager_panel_is_not_on_screen_despite_wda_saying_so():
    """WDA calls the parked layer panel visible while it sits at a negative x.

    Believing it makes every control on the current panel look like a duplicate, so a name
    that is unique on screen is refused as ambiguous and the tap never happens.
    """
    parked = [e for e in matching(_PAGER, "new diy btn add color dark") if e["rect"][0] == "-289"]
    assert parked, "fixture should carry the parked panel's add-colour button"
    assert parked[0]["wda_visible"] is True
    assert parked[0]["onscreen"] is False
    assert parked[0]["visible"] is False


def test_unresolved_frame_is_not_treated_as_visible():
    """The fault that made this module tap the wrong control.

    The brightness sub-panel's children get the enclosing cell's ORIGIN with their own size,
    so `Brightest-Darkest` claims (0, 202) while rendering near the bottom of the form. That
    rect IS inside the screen, so an on-screen test alone passes it, and the click then lands
    on whatever occupies (54, 210). Here that is the Select Type row, which is exactly what
    happened live: asking for Brightness Order opened Select Type, and WDA answered success.

    `visible` must therefore be the AND of both signals, never either one alone.
    """
    row = unique(_PAGER, "Brightest-Darkest")
    assert row["onscreen"] is True, "its bogus rect is inside the screen, which is the trap"
    assert row["wda_visible"] is False
    assert row["visible"] is False


def test_the_bogus_rect_aims_outside_its_own_section():
    """Shows WHY clicking it is unsafe rather than merely unhelpful.

    A brightness row can only legitimately sit BELOW the Brightness header. The rect this
    element reports puts its midpoint above it, up among the select-type controls, so the tap
    cannot land in the section it belongs to no matter what else is on screen. Live, it opened
    Select Type.
    """
    row = unique(_PAGER, "Brightest-Darkest")
    midpoint_y = int(row["rect"][1]) + int(row["rect"][3]) / 2
    assert midpoint_y < int(unique(_PAGER, "Brightness")["rect"][1])
    assert midpoint_y > int(unique(_PAGER, "Select IC Continuously")["rect"][1])


def test_unique_picks_the_on_screen_twin():
    """Two identically named buttons, one parked off screen. That is not a real ambiguity."""
    chosen = unique(_PAGER, "new diy btn add color dark")
    assert chosen["rect"] == ("113", "699", "35", "35")


def test_pair_resolves_fold_buttons_by_their_section_header():
    """Every collapsible section's fold button shares one name, so the only thing that tells
    them apart is which header they sit level with."""
    assert pair(_PAGER, "new workshop icon fold", "Applied Area")["rect"][1] == "240"
    assert pair(_PAGER, "new workshop icon fold", "Color")["rect"][1] == "616"


def test_pair_takes_the_badge_above_a_grid_caption():
    """A tile's caption sits BELOW its tile, so its edit badge is above the caption. Nearest
    by row picks the badge of the row BELOW, which silently opened the wrong Workshop item
    and looked like a successful tap."""
    assert pair(_PAGER, "new diy btn detail edit dark", "ChaosTwo", where="above")["rect"][1] == "275"


def test_pair_without_a_stated_relationship_is_not_guessed_into_the_next_row():
    """Guards the bug directly: 'nearest' alone resolves to the row below."""
    nearest = pair(_PAGER, "new diy btn detail edit dark", "ChaosTwo")
    assert nearest["rect"][1] == "397", "documents the wrong answer that 'where' exists to avoid"


def test_pair_stays_in_the_anchors_column():
    """Two tiles share a row, so the column is what separates them."""
    assert pair(_PAGER, "new diy btn detail edit dark", "ChaosFive", where="above")["rect"][0] == "73"
    assert pair(_PAGER, "new diy btn detail edit dark", "ChaosTwo", where="above")["rect"][0] == "167"


def test_pair_refuses_an_unknown_relationship():
    with pytest.raises(ValueError):
        pair(_PAGER, "new workshop icon fold", "Color", where="near")


def test_pair_reports_nothing_in_that_direction_rather_than_wrapping():
    """Both badges in Moving Christmas's column sit above it, being the last row."""
    with pytest.raises(NotFoundError):
        pair(_PAGER, "new diy btn detail edit dark", "Moving Christmas", where="below")
