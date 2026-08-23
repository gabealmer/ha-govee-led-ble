"""Fixed source-size report categories."""

from scripts.report_source_size import categories, line_count


def test_line_count_matches_wc_semantics() -> None:
    assert line_count(b"one\ntwo\n") == 2
    assert line_count(b"one") == 0


def test_source_categories_are_stable() -> None:
    assert categories("custom_components/ha_govee_led_ble/light.py") == {"handwritten_backend"}
    assert categories("custom_components/ha_govee_led_ble/generated_protocol/status_reply.py") == {
        "tracked_generated_output"
    }
    assert categories("custom_components/ha_govee_led_ble/frontend/editor.js") == {"frontend_source"}
    assert categories("frontend/src/panel.ts") == {"frontend_source"}
    assert categories("frontend/tests/unit/panel.spec.ts") == {"frontend_tests"}
    assert categories("tests/test_light.py") == {"python_tests"}
    assert categories("tools/generate_frontend_contract_fixtures.py") == {"non_kaitai_tools"}
    assert categories("tools/ble/kaitai/status_reply.ksy") == {"ksy"}
    assert categories("scripts/package.py") == {"build_scripts_workflows"}
    assert categories("README.md") == {"documentation"}
    assert categories("custom_components/ha_govee_led_ble/frontend/effect-studio-bootstrap.hash.js") == {
        "tracked_generated_output"
    }
