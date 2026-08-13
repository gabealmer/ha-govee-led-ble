import { expect, test, type Page } from "@playwright/test";

const studioSelector = "ha-govee-led-ble-editor";

async function openStudio(page: Page, query = "") {
  await page.goto(`/${query}`);
  const studio = page.locator(studioSelector);
  await expect(
    studio.getByRole("heading", { name: "Effect Studio" }),
  ).toBeVisible();
  return studio;
}

async function openScene(
  page: Page,
  category: string,
  name: RegExp,
) {
  const studio = page.locator(studioSelector);
  await studio.getByRole("button", { name: "Scenes", exact: true }).click();
  const sceneBrowser = studio.locator("govee-scene-browser");
  await expect(
    sceneBrowser.getByRole("complementary", { name: "Scene categories" }),
  ).toBeVisible();
  await sceneBrowser.getByRole("button", { name: category }).click();
  await sceneBrowser.getByRole("button", { name }).click();
  await expect(
    sceneBrowser.getByRole("button", { name: "Use as template" }),
  ).toBeEnabled();
  return sceneBrowser;
}

async function openLayeredScene(page: Page) {
  return openScene(page, "Nature", /Aurora Layers/);
}

async function openPaletteScene(
  page: Page,
  category: string,
  name: RegExp,
) {
  const studio = page.locator(studioSelector);
  await studio.getByRole("button", { name: "Scenes", exact: true }).click();
  const sceneBrowser = studio.locator("govee-scene-browser");
  await expect(
    sceneBrowser.getByRole("complementary", { name: "Scene categories" }),
  ).toBeVisible();
  await sceneBrowser.getByRole("button", { name: category }).click();
  await sceneBrowser.getByRole("button", { name }).click();
  await expect(
    sceneBrowser.locator("govee-effect-preview"),
  ).toBeVisible();
  return sceneBrowser;
}

test("capability gates Apply while retaining supported H617A custom Apply", async ({
  page,
}) => {
  const studio = await openStudio(page);

  await expect(
    studio.getByRole("navigation", { name: "Create" }),
  ).toBeVisible();
  const modes = studio.getByRole("tablist", { name: "Custom effect type" });
  await expect(modes.getByRole("tab", { name: "Painted" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await modes.getByRole("tab", { name: "Single" }).click();
  await expect(modes.getByRole("tab", { name: "Single" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await modes.getByRole("tab", { name: "Multi" }).click();
  await expect(modes.getByRole("tab", { name: "Multi" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await modes.getByRole("tab", { name: "Painted" }).click();
  await expect(
    studio.locator(".editor").getByRole("button", { name: "Apply" }),
  ).toBeEnabled();
  await expect(
    studio.getByRole("button", { name: "Segment 1, #2f6fed" }),
  ).toBeEnabled();

  await studio.getByRole("button", { name: "Advanced" }).click();
  const apply = studio
    .locator(".editor")
    .getByRole("button", { name: "Apply" });
  const reason = studio.getByRole("note").filter({
    hasText: "Layered effects can be saved, but Apply is unavailable",
  });
  await expect(apply).toBeDisabled();
  await expect(apply).toHaveAttribute(
    "aria-describedby",
    "advanced-apply-reason",
  );
  await expect(reason).toBeVisible();
  await expect(
    studio.getByRole("tablist", { name: "Effect layers" }),
  ).toBeVisible();
  await expect(studio.getByRole("tabpanel")).toBeVisible();
  await expect(
    studio.getByRole("list", { name: "Colours" }),
  ).toBeVisible();
});

test("known single effects animate while unknown Type04 identities remain gated", async ({
  page,
}) => {
  const studio = await openStudio(page);
  const preview = studio.locator("govee-effect-preview");

  await studio.getByRole("button", { name: "Supported painted effect" }).click();
  await expect(preview.getByText("Deterministic", { exact: true })).toBeVisible();
  await expect(preview.getByRole("button", { name: /^Segment / })).toHaveCount(
    15,
  );
  await expect(
    preview.getByText(
      "only the exact 15-segment background and group map is shown",
    ),
  ).toBeVisible();
  await expect(preview.locator(".palette, .sequence, .scene-steps, .layers")).toHaveCount(0);
  const paintedLabels = await preview
    .getByRole("button", { name: /^Segment / })
    .evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute("aria-label")),
    );
  expect(paintedLabels).toEqual([
    "Segment 1, #2f6fed",
    "Segment 2, #2f6fed",
    "Segment 3, #2f6fed",
    ...Array.from(
      { length: 12 },
      (_, index) => `Segment ${index + 4}, #000000`,
    ),
  ]);
  const firstSegment = preview.getByRole("button", {
    name: "Segment 1, #2f6fed",
  });
  await firstSegment.focus();
  await firstSegment.press("Enter");
  await expect(
    preview.getByRole("button", { name: "Segment 1, #2f80ed" }),
  ).toBeVisible();

  const modes = studio.getByRole("tablist", { name: "Custom effect type" });
  await modes.getByRole("tab", { name: "Single" }).click();
  await expect(
    preview.getByText("Capture-backed", { exact: true }),
  ).toBeVisible();
  await expect(
    preview.getByRole("heading", { name: "Observed Fade preview" }),
  ).toBeVisible();
  await expect(preview.locator("[data-effect=fade]")).toBeVisible();
  await expect(preview.locator(".custom-animation-cell")).toHaveCount(15);

  const customEditor = studio.locator("govee-custom-effect-editor");
  await customEditor
    .getByRole("button", { name: "Choose effect, current Fade" })
    .click();
  await customEditor.getByRole("button", { name: "Jumping", exact: true }).click();
  await expect(
    preview.getByRole("heading", { name: "Observed Jumping preview" }),
  ).toBeVisible();
  await expect(preview.locator("[data-effect=jumping]")).toBeVisible();

  await customEditor
    .getByRole("button", { name: "Choose effect, current Jumping" })
    .click();
  await customEditor.getByRole("button", { name: "Marquee", exact: true }).click();
  await expect(
    preview.getByRole("heading", { name: "Observed Marquee preview" }),
  ).toBeVisible();
  await expect(preview.locator("[data-effect=marquee]")).toBeVisible();

  await studio.getByRole("button", { name: "Verified fixture-backed multi effect" }).click();
  await expect(
    preview.getByRole("heading", { name: "Multi effect sequence" }),
  ).toBeVisible();
  await expect(
    preview.getByRole("list", { name: "Preview palette" }).getByRole("listitem"),
  ).toHaveCount(2);
  await expect(preview.getByLabel("Colour 1, #0c2238")).toBeVisible();
  await expect(
    preview.getByRole("list", { name: "Catalogue effect order" }).getByRole("listitem"),
  ).toHaveText([
    /1\s+Fade\s+Structural/,
    /2\s+Unknown catalogue identity\s+Raw family 254, variant 253\s+Opaque \/ unknown/,
    /3\s+Marquee\s+Structural/,
  ]);
  await expect(preview.getByText("Deterministic", { exact: true })).toHaveCount(0);

  await studio.getByRole("button", { name: "Unknown Type04 pair" }).click();
  await expect(
    preview.getByText("Opaque / unknown", { exact: true }),
  ).toBeVisible();
  await expect(preview.getByText("Raw family 254, variant 253")).toBeVisible();
  await expect(preview.getByLabel("Colour 1, #ff0000")).toBeVisible();
  await expect(preview.getByLabel("Colour 2, #0000ff")).toBeVisible();
  await expect(preview.getByText(/Family 254|style 253/)).toHaveCount(0);

  await studio.getByRole("button", { name: "Uncaptured special DIY pair" }).click();
  await expect(
    preview.getByText("Opaque / unknown", { exact: true }),
  ).toBeVisible();
  await expect(preview.getByText("Raw family 252, variant 251")).toBeVisible();
  await expect(preview.getByLabel("Colour 1, #090807")).toBeVisible();
  await expect(preview.getByText("Deterministic", { exact: true })).toHaveCount(0);
  expect(
    await preview.locator("*").evaluateAll((elements) =>
      elements.filter(
        (element) => getComputedStyle(element).animationName !== "none",
      ).length,
    ),
  ).toBe(0);
});

test("scene Type 0 remains opaque without a visual parameter preview", async ({
  page,
}) => {
  await openStudio(page);
  const studio = page.locator(studioSelector);
  await studio.getByRole("button", { name: "Scenes", exact: true }).click();
  const sceneBrowser = studio.locator("govee-scene-browser");
  await sceneBrowser.getByRole("button", { name: "Everyday" }).click();
  await sceneBrowser.getByRole("button", { name: /^Reading/ }).click();
  const preview = sceneBrowser.locator("govee-effect-preview");

  await expect(
    preview.getByRole("heading", { name: "Built-in scene identity" }),
  ).toBeVisible();
  await expect(
    preview.getByText("Scene Type 0 has no documented visual parameters"),
  ).toBeVisible();
  await expect(preview.getByText("Scene 100, effect 200")).toBeVisible();
  await expect(preview.getByRole("list", { name: "Preview palette" })).toHaveCount(0);
  await expect(preview.locator(".preview-cell, .scene-steps, .layers")).toHaveCount(0);
});

test("reviewed capture-backed profiles render all five immutable scene identities", async ({
  page,
}) => {
  await openStudio(page);
  const studio = page.locator(studioSelector);
  await studio.getByRole("button", { name: "Scenes", exact: true }).click();
  const sceneBrowser = studio.locator("govee-scene-browser");
  await sceneBrowser
    .getByRole("button", { name: "Observed captures", exact: true })
    .click();

  for (const name of ["Sunrise", "Sunset", "Blue Lagoon", "Warm Glow"]) {
    await sceneBrowser.getByRole("button", { name: new RegExp(`^${name}`) }).click();
    const observed = sceneBrowser
      .locator("govee-effect-preview")
      .filter({ hasText: "Observed static scene" });
    await expect(
      sceneBrowser.getByRole("heading", { name: "Observed static scene" }),
    ).toBeVisible();
    await expect(
      sceneBrowser.getByText("Capture-backed", { exact: true }),
    ).toBeVisible();
    await expect(
      sceneBrowser.getByRole("img", {
        name: /Capture-backed abstract map of 15 sampled regions/,
      }),
    ).toBeVisible();
    await expect(
      sceneBrowser.getByRole("note").filter({
        hasText: "The abstract regions are not physical LED geometry.",
      }),
    ).toBeVisible();
    await expect(
      observed.locator(".capture-evidence").getByText(
        "reviewed recorded capture with spatial lane calibration",
        { exact: false },
      ),
    ).toBeVisible();
    await expect(
      observed
        .locator(".capture-evidence")
        .getByText("Camera colour is uncalibrated.", { exact: false }),
    ).toBeVisible();
    await expect(observed.locator(".preview-cell")).toHaveCount(15);
  }

  await sceneBrowser.getByRole("button", { name: "Blue Sweep" }).click();
  const observedSweep = sceneBrowser
    .locator("govee-effect-preview")
    .filter({ hasText: "Observed directional sweep" });
  await expect(
    observedSweep.getByText("Capture-backed", { exact: true }),
  ).toBeVisible();
  await expect(
    observedSweep.getByRole("img", {
      name: /towards the first sampled region, with 2 phase-separated travelling bands/,
    }),
  ).toBeVisible();
  await expect(observedSweep.locator(".sweep-cell")).toHaveCount(15);
  await expect(observedSweep.locator(".sweep-band")).toHaveCount(2);
  expect(
    await observedSweep.locator(".sweep-band").evaluateAll((bands) =>
      bands.map((band) =>
        band.closest(".sweep-cell")?.getAttribute("data-logical-lane"),
      ),
    ),
  ).toEqual(["6", "14"]);
  await expect(observedSweep.locator(".directional-sweep")).toHaveAttribute(
    "data-phase-separation",
    "8",
  );
  await expect(observedSweep.locator(".directional-sweep")).toHaveAttribute(
    "data-motion-state",
    "default",
  );
  const sweepTiming = await observedSweep.locator(".directional-sweep").evaluate(
    (sweep) => ({
      step: Number(sweep.getAttribute("data-step-interval-ms")),
      fullCircuit: Number(sweep.getAttribute("data-full-circuit-ms")),
      observedRepeat: Number(sweep.getAttribute("data-observed-repeat-ms")),
    }),
  );
  expect(sweepTiming.step).toBeCloseTo(527.067, 3);
  expect(Math.abs(sweepTiming.step * 15 - sweepTiming.fullCircuit)).toBeLessThan(
    0.01,
  );
  expect(
    Math.abs(sweepTiming.fullCircuit / 2 - sweepTiming.observedRepeat),
  ).toBeLessThan(0.01);
  await expect(
    sceneBrowser.getByRole("heading", { name: "Captured layered scene structure" }),
  ).toBeVisible();
  const speed = sceneBrowser.getByRole("group", { name: "Scene speed" });
  await expect(speed.getByRole("button")).toHaveCount(3);
  await expect(speed.getByRole("button", { name: "Default" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    observedSweep.getByText("reviewed visual repeat is 3.953 seconds at Default speed"),
  ).toBeVisible();
  await page.evaluate(() => {
    const target = window as Window & {
      previewSweepTimings?: number[];
    };
    target.previewSweepTimings = [];
    document.addEventListener("preview-sweep-lane-change", () => {
      target.previewSweepTimings?.push(performance.now());
    });
  });
  const defaultTransitionTimings = (await page
    .waitForFunction(
      () => {
        const timings = (
          window as Window & { previewSweepTimings?: number[] }
        ).previewSweepTimings;
        return timings && timings.length >= 2 ? timings.slice(0, 2) : undefined;
      },
      undefined,
      { timeout: 2_500 },
    )
    .then((handle) => handle.jsonValue())) as number[];
  const observedStepInterval =
    defaultTransitionTimings[1]! - defaultTransitionTimings[0]!;
  expect(observedStepInterval).toBeGreaterThan(sweepTiming.step - 150);
  expect(observedStepInterval).toBeLessThan(sweepTiming.step + 150);
  await speed.getByRole("button", { name: "Slower", exact: true }).click();
  await expect(speed.getByRole("button", { name: "Slower", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    observedSweep.getByText(
      "Timing and motion were observed only at Default speed. This non-default Speed selection freezes a phase-separated capture snapshot.",
    ),
  ).toBeVisible();
  const frozenLanes = await observedSweep
    .locator(".directional-sweep")
    .getAttribute("data-logical-lanes");
  await expect(observedSweep.locator(".directional-sweep")).toHaveAttribute(
    "data-motion-state",
    "snapshot",
  );
  await page.waitForTimeout(700);
  await expect(observedSweep.locator(".directional-sweep")).toHaveAttribute(
    "data-logical-lanes",
    frozenLanes ?? "",
  );
  await expect(observedSweep.locator(".sweep-band")).toHaveCount(2);
  const firstSeed = await observedSweep
    .locator(".directional-sweep")
    .getAttribute("data-preview-seed");

  await sceneBrowser.getByRole("button", { name: /^Sunrise/ }).click();
  await sceneBrowser.getByRole("button", { name: "Blue Sweep" }).click();
  await expect(
    observedSweep.locator(".directional-sweep"),
  ).toHaveAttribute("data-preview-seed", firstSeed ?? "");
  await expect(
    sceneBrowser.getByRole("heading", { name: "Captured layered scene structure" }),
  ).toBeVisible();

  const sixBandLanes = await observedSweep.evaluate(async (element) => {
    interface PreviewElement extends HTMLElement {
      model: {
        travellingBands: number;
      };
      updateComplete: Promise<unknown>;
    }
    const preview = element as PreviewElement;
    preview.model = { ...preview.model, travellingBands: 6 };
    await preview.updateComplete;
    return [...(preview.shadowRoot?.querySelectorAll(".sweep-band") ?? [])].map(
      (band) => band.closest(".sweep-cell")?.getAttribute("data-logical-lane"),
    );
  });
  expect(sixBandLanes).toHaveLength(6);
  expect(new Set(sixBandLanes).size).toBe(6);
});

test("capture-backed previews respect reduced motion and retain saved template identity", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openStudio(page);
  const studio = page.locator(studioSelector);
  await studio.getByRole("button", { name: "Scenes", exact: true }).click();
  const sceneBrowser = studio.locator("govee-scene-browser");
  await sceneBrowser
    .getByRole("button", { name: "Observed captures", exact: true })
    .click();
  await sceneBrowser.getByRole("button", { name: "Blue Sweep" }).click();
  const reducedSweep = sceneBrowser.locator(".directional-sweep");
  const reducedLane = await reducedSweep.getAttribute("data-logical-lane");
  await page.waitForTimeout(700);
  await expect(reducedSweep).toHaveAttribute(
    "data-logical-lane",
    reducedLane ?? "",
  );
  await expect(reducedSweep.locator(".sweep-band")).toHaveCount(2);

  await sceneBrowser.getByRole("button", { name: /^Sunrise/ }).click();
  await sceneBrowser.getByRole("button", { name: "Save copy" }).click();
  await expect(
    sceneBrowser.getByRole("status").filter({ hasText: "Custom scene saved." }),
  ).toBeVisible();
  await page.reload();
  const reloadedStudio = page.locator(studioSelector);
  await expect(
    reloadedStudio.getByRole("heading", { name: "Effect Studio" }),
  ).toBeVisible();
  await reloadedStudio.getByRole("button", { name: "Scenes", exact: true }).click();
  const reloadedBrowser = reloadedStudio.locator("govee-scene-browser");
  await reloadedBrowser.getByRole("button", { name: "Custom", exact: true }).click();
  await reloadedBrowser.getByRole("button", { name: /Sunrise copy/ }).click();
  await expect(
    reloadedBrowser.getByRole("heading", { name: "Observed static scene" }),
  ).toBeVisible();
  await expect(
    reloadedBrowser.getByRole("heading", { name: "Built-in scene identity" }),
  ).toBeVisible();
});

for (const direction of ["ltr", "rtl"] as const) {
  test(`directional sweep uses ordered logical lanes and wraps towards first in ${direction.toUpperCase()}`, async ({
    page,
  }) => {
    await openStudio(page, direction === "rtl" ? "?rtl=1" : "");
    const studio = page.locator(studioSelector);
    await studio.getByRole("button", { name: "Scenes", exact: true }).click();
    const sceneBrowser = studio.locator("govee-scene-browser");
    await sceneBrowser
      .getByRole("button", { name: "Observed captures", exact: true })
      .click();
    await page.evaluate(() => {
      const target = window as Window & {
        previewSweepTransitions?: {
          lane: number;
          previousLane: number;
          sequence: number;
          lanes: number[];
          previousLanes: number[];
        }[];
      };
      target.previewSweepTransitions = [];
      document.addEventListener("preview-sweep-lane-change", (event) => {
        const detail = (event as CustomEvent<{
          lane: number;
          previousLane: number;
          sequence: number;
          lanes: number[];
          previousLanes: number[];
        }>).detail;
        target.previewSweepTransitions?.push(detail);
      });
    });
    await sceneBrowser.getByRole("button", { name: "Blue Sweep" }).click();
    const sweep = sceneBrowser.locator(".directional-sweep");
    const lanes = sweep.locator(".sweep-cell");

    await expect(lanes).toHaveCount(15);
    expect(
      await lanes.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("data-logical-lane")),
      ),
    ).toEqual(Array.from({ length: 15 }, (_, index) => String(index)));
    const positions = await lanes.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().left),
    );
    expect(positions[0]).toBeLessThan(positions[14]);
    await expect(sweep).toHaveAttribute("data-logical-lane", "6");
    expect(
      await sweep.locator(".sweep-band").evaluateAll((bands) =>
        bands.map((band) =>
          band.closest(".sweep-cell")?.getAttribute("data-logical-lane"),
        ),
      ),
    ).toEqual(["6", "14"]);
    await expect(sweep).toHaveAttribute("data-phase-separation", "8");
    const transitions = (await page
      .waitForFunction(
        () => {
          const target = window as Window & {
            previewSweepTransitions?: {
              lane: number;
              previousLane: number;
              sequence: number;
              lanes: number[];
              previousLanes: number[];
            }[];
          };
          const transitions = target.previewSweepTransitions ?? [];
          const wrapIndex = transitions.findIndex(
            (transition) =>
              transition.previousLane === 0 && transition.lane === 14,
          );
          return wrapIndex < 0 ? undefined : transitions.slice(0, wrapIndex + 1);
        },
        undefined,
        { timeout: 5_000 },
      )
      .then((handle) => handle.jsonValue())) as {
      lane: number;
      previousLane: number;
      sequence: number;
      lanes: number[];
      previousLanes: number[];
    }[];
    expect(transitions.map((transition) => transition.lane)).toContain(0);
    expect(
      transitions.some(
        (transition) =>
          transition.previousLane === 0 && transition.lane === 14,
      ),
    ).toBe(true);
    expect(
      transitions.every(
        (transition, index) =>
          transition.sequence === index &&
          (transition.previousLane - transition.lane + 15) % 15 === 1 &&
          transition.lanes.length === 2 &&
          transition.previousLanes.length === 2 &&
          transition.previousLanes.every(
            (previousLane, laneIndex) =>
              (previousLane - transition.lanes[laneIndex]! + 15) % 15 === 1,
          ) &&
          (transition.lanes[1]! - transition.lanes[0]! + 15) % 15 === 8 &&
          (transition.previousLanes[1]! - transition.previousLanes[0]! + 15) %
            15 ===
            8,
      ),
    ).toBe(true);
    await expect
      .poll(async () => sweep.getAttribute("data-logical-lane"))
      .not.toBeNull();
    await expect(
      sweep.locator(
        `.sweep-cell.current[data-logical-lane="${await sweep.getAttribute(
          "data-logical-lane",
        )}"]`,
      ),
    ).toBeVisible();
    await expect(sweep.locator(".sweep-band")).toHaveCount(2);
  });
}

test("scene detail validation discards malformed optional capture-backed profiles", async ({
  page,
}) => {
  await openStudio(page);
  const result = await page.evaluate(() => {
    const detail = {
      scene: {
        scene_id: 1011,
        effect_id: 1073,
        category_id: 700,
        category: "Observed captures",
        name: "sunrise",
        variant: "",
        display_name: "Sunrise",
        scene_type: 0,
        parameter_kind: "none",
        speed: null,
      },
      content: {
        kind: "scene_builtin",
        template: {
          sku: "H617A",
          scene_id: 1011,
          effect_id: 1073,
          catalogue_schema_version: 1,
        },
        speed_index: null,
      },
    };
    const profile = {
      schema_version: 1,
      fidelity: "capture_backed",
      sku: "H617A",
      scene_id: 1011,
      effect_id: 1073,
      review_state: "reviewed",
      minimum_review_confidence: 0.85,
      review_confidence: 0.9,
      primitive: "static",
      illuminated_segments: Array.from({ length: 15 }, (_, index) => index),
      limitations: ["Observational evidence only."],
      evidence: {
        corpus_id: "20260812-h617a-scenes",
        contact_sheet_sha256:
          "29754d0aa2fc51e75ced394e051551797ede5a0be02b2c8bd631a302a753c2d6",
      },
      palette: {
        colour_space: "uncalibrated_camera_srgb",
        segment_rgb: Array.from({ length: 15 }, () => [1, 2, 3]),
      },
    };
    const decode = (value: unknown) =>
      window.testHarness.validateSceneDetail(value) as {
        content: { kind: string };
        preview_profile?: unknown;
      };
    const malformed = [
      { ...profile, review_state: "pending_human_review" },
      { ...profile, primitive: "global_pulse" },
      { ...profile, name: "Display-only" },
      { ...profile, scene_id: 1012 },
      "not an object",
    ];
    return {
      legacy: decode(detail),
      malformed: malformed.map((preview_profile) =>
        decode({ ...detail, preview_profile }),
      ),
    };
  });

  expect(result.legacy).toMatchObject({ content: { kind: "scene_builtin" } });
  expect(result.legacy).not.toHaveProperty("preview_profile");
  for (const detail of result.malformed) {
    expect(detail).toMatchObject({ content: { kind: "scene_builtin" } });
    expect(detail).not.toHaveProperty("preview_profile");
  }
});

test("captured layout 0 palette scenes expose lossless structure", async ({
  page,
}) => {
  await openStudio(page);
  const halloween = await openPaletteScene(page, "Festival", /^Halloween/);
  const preview = halloween.locator("govee-effect-preview");

  await expect(
    preview.getByRole("heading", {
      name: "Captured palette scene structure",
    }),
  ).toBeVisible();
  await expect(preview.getByText("Layout", { exact: true })).toBeVisible();
  await expect(preview.getByText("0", { exact: true })).toBeVisible();
  await expect(preview.getByText("Brightness flag")).toBeVisible();
  await expect(preview.getByText("Set", { exact: true })).toBeVisible();
  await expect(
    preview.getByRole("list", { name: "Ordered scene steps" }).getByRole("listitem"),
  ).toHaveCount(6);
  await expect(preview.getByText("Raw value 5")).toHaveCount(5);
  await expect(preview.getByText("Raw value 6")).toHaveCount(1);
  await expect(
    preview.getByRole("list", { name: "Preview palette" }).getByRole("listitem"),
  ).toHaveCount(4);
  await expect(preview.getByLabel("Colour 1, #ff1e00")).toBeVisible();
  await expect(
    preview.getByText("Timing, motion and device animation are not inferred."),
  ).toBeVisible();

  await halloween.getByRole("button", { name: "Life" }).click();
  await halloween.getByRole("button", { name: /^Sweet/ }).click();
  await expect(
    halloween.getByRole("heading", {
      name: "Captured palette scene structure",
    }),
  ).toBeVisible();
  await expect(halloween.getByText("Raw value 50")).toBeVisible();
  await expect(halloween.getByLabel("Colour 4, #e300ff")).toBeVisible();
});

test("palette scene validation enforces schema boundaries and layout rules", async ({
  page,
}) => {
  await openStudio(page);
  const result = await page.evaluate(() => {
    const decodeEffectContent = (value: unknown) =>
      window.testHarness.backend.validateEffectContent(value);
    const template = {
      sku: "SYNTHETIC",
      scene_id: 1,
      effect_id: 2,
      catalogue_schema_version: 1,
    };
    const syntheticSchemaOnlyLayout1 = {
      kind: "scene_palette",
      template,
      layout: 1,
      brightness_flag: true,
      steps: [
        {
          value: 0x1234,
          colour: [1, 2, 3],
          inline_colour: [4, 5, 6],
        },
        {
          value: 2,
          colour: [7, 8, 9],
          inline_colour: [10, 11, 12],
        },
      ],
      palette: [],
      speed_index: 255,
    };
    const boundaryLayout0 = {
      kind: "scene_palette",
      template,
      layout: 0,
      brightness_flag: false,
      steps: Array.from({ length: 255 }, (_, value) => ({
        value,
        colour: [1, 2, 3],
        inline_colour: null,
      })),
      palette: Array.from({ length: 255 }, () => [4, 5, 6]),
      speed_index: null,
    };
    const invalidPayloads = [
      { ...syntheticSchemaOnlyLayout1, layout: 2 },
      { ...syntheticSchemaOnlyLayout1, brightness_flag: 1 },
      { ...syntheticSchemaOnlyLayout1, steps: "not-an-array" },
      {
        ...syntheticSchemaOnlyLayout1,
        steps: Array.from({ length: 256 }, () => syntheticSchemaOnlyLayout1.steps[0]),
      },
      {
        ...syntheticSchemaOnlyLayout1,
        steps: [{ ...syntheticSchemaOnlyLayout1.steps[0], value: 65_536 }],
      },
      {
        ...syntheticSchemaOnlyLayout1,
        steps: [{ ...syntheticSchemaOnlyLayout1.steps[0], colour: [1, 2] }],
      },
      {
        ...syntheticSchemaOnlyLayout1,
        steps: [{ ...syntheticSchemaOnlyLayout1.steps[0], inline_colour: null }],
      },
      { ...syntheticSchemaOnlyLayout1, palette: [[1, 2, 3]] },
      { ...syntheticSchemaOnlyLayout1, speed_index: 256 },
      {
        ...boundaryLayout0,
        steps: [{ value: 1, colour: [1, 2, 3], inline_colour: [4, 5, 6] }],
      },
      {
        ...boundaryLayout0,
        palette: Array.from({ length: 256 }, () => [4, 5, 6]),
      },
    ];
    const synthetic = decodeEffectContent(syntheticSchemaOnlyLayout1);
    const boundary = decodeEffectContent(boundaryLayout0);
    return {
      synthetic,
      boundaryStepCount:
        boundary.kind === "scene_palette" ? boundary.steps.length : -1,
      boundaryPaletteCount:
        boundary.kind === "scene_palette" ? boundary.palette.length : -1,
      rejected: invalidPayloads.map((payload) => {
        try {
          decodeEffectContent(payload);
          return false;
        } catch {
          return true;
        }
      }),
    };
  });

  expect(result.synthetic).toMatchObject({
    kind: "scene_palette",
    layout: 1,
    speed_index: 255,
    steps: [
      { value: 0x1234, inline_colour: [4, 5, 6] },
      { value: 2, inline_colour: [10, 11, 12] },
    ],
  });
  expect(result.boundaryStepCount).toBe(255);
  expect(result.boundaryPaletteCount).toBe(255);
  expect(result.rejected).toEqual(Array.from({ length: 11 }, () => true));
});

test("palette scene reserved config flags survive decoding and wire round trips", async ({
  page,
}) => {
  await openStudio(page);
  const result = await page.evaluate(() => {
    const decode = (value: unknown) =>
      window.testHarness.backend.validateEffectContent(value);
    const base = {
      kind: "scene_palette",
      template: {
        sku: "SYNTHETIC",
        scene_id: 1,
        effect_id: 2,
        catalogue_schema_version: 1,
      },
      layout: 0,
      brightness_flag: false,
      steps: [{ value: 1, colour: [1, 2, 3], inline_colour: null }],
      palette: [[4, 5, 6]],
      speed_index: null,
    };
    const decoded = decode({ ...base, config_flags: 0x08 });
    // A decoded scene is its own wire content, so re-decoding proves the field survives.
    const roundTripped = decode(decoded);
    const omitted = decode(base);
    return {
      decoded:
        decoded.kind === "scene_palette" ? decoded.config_flags ?? null : null,
      roundTripped:
        roundTripped.kind === "scene_palette"
          ? roundTripped.config_flags ?? null
          : null,
      omittedHasField:
        omitted.kind === "scene_palette" ? "config_flags" in omitted : true,
      rejectsNonReservedBit: (() => {
        try {
          decode({ ...base, config_flags: 0x01 });
          return false;
        } catch {
          return true;
        }
      })(),
    };
  });

  expect(result.decoded).toBe(0x08);
  expect(result.roundTripped).toBe(0x08);
  expect(result.omittedHasField).toBe(false);
  expect(result.rejectsNonReservedBit).toBe(true);
});

test("palette and layered trailing padding survive decoding and wire round trips", async ({
  page,
}) => {
  await openStudio(page);
  const result = await page.evaluate(() => {
    const decode = (value: unknown) =>
      window.testHarness.backend.validateEffectContent(value);
    const paletteBase = {
      kind: "scene_palette",
      template: {
        sku: "SYNTHETIC",
        scene_id: 1,
        effect_id: 2,
        catalogue_schema_version: 1,
      },
      layout: 0,
      brightness_flag: false,
      steps: [{ value: 1, colour: [1, 2, 3], inline_colour: null }],
      palette: [[4, 5, 6]],
      speed_index: null,
    };
    const layeredBase = {
      kind: "scene_layered",
      template: {
        sku: "SYNTHETIC",
        scene_id: 3,
        effect_id: 4,
        catalogue_schema_version: 1,
      },
      effect: { layers: [] },
      speed_index: null,
      raw_param: "00",
    };
    const roundTrippedPadding = (value: unknown) => {
      const decoded = decode(value);
      // A decoded scene is its own wire content, so re-decoding proves the field survives.
      const roundTripped = decode(decoded) as { trailing_padding?: number };
      return roundTripped.trailing_padding ?? null;
    };
    const rejects = (value: unknown) => {
      try {
        decode(value);
        return false;
      } catch {
        return true;
      }
    };
    const oversize = 0xff * 17 + 1;
    return {
      palettePadding: roundTrippedPadding({
        ...paletteBase,
        trailing_padding: 34,
      }),
      paletteOmitsField: "trailing_padding" in decode(paletteBase),
      paletteRejectsOversize: rejects({
        ...paletteBase,
        trailing_padding: oversize,
      }),
      paletteRejectsNegative: rejects({
        ...paletteBase,
        trailing_padding: -1,
      }),
      layeredPadding: roundTrippedPadding({
        ...layeredBase,
        trailing_padding: 34,
      }),
      layeredOmitsField: "trailing_padding" in decode(layeredBase),
      layeredRejectsOversize: rejects({
        ...layeredBase,
        trailing_padding: oversize,
      }),
    };
  });

  expect(result.palettePadding).toBe(34);
  expect(result.paletteOmitsField).toBe(false);
  expect(result.paletteRejectsOversize).toBe(true);
  expect(result.paletteRejectsNegative).toBe(true);
  expect(result.layeredPadding).toBe(34);
  expect(result.layeredOmitsField).toBe(false);
  expect(result.layeredRejectsOversize).toBe(true);
});

test("layer and movement unknown flags reject known bits and survive round trips", async ({
  page,
}) => {
  await openStudio(page);
  const result = await page.evaluate(() => {
    const decode = (value: unknown) =>
      window.testHarness.backend.validateEffectContent(value);
    const movement = (unknownFlags: number) => ({
      enabled: false,
      enter_exit: false,
      direction: 0,
      distance: 1,
      speed: 128,
      unknown_flags: unknownFlags,
    });
    const layer = (overrides: Record<string, unknown>) => ({
      area: { start_tenths: 0, width_tenths: 10 },
      selection: { type: 0, param_1: 0, param_2: 1 },
      brightness_gradient: false,
      brightness_patterns: [
        {
          scope_high: 255,
          scope_low: 0,
          order: 0,
          change_speed: 128,
          brightest_retention: 20,
          darkest_retention: 20,
        },
      ],
      distribution: { method: 1, backwards: false },
      colour_speed: 128,
      colour_retention: 20,
      palette: [
        [255, 0, 0],
        [0, 0, 255],
      ],
      selected_movement: movement(0),
      overall_movement: movement(0),
      priority: 0,
      unknown_flags: 0,
      excess: "",
      ...overrides,
    });
    const advanced = (singleLayer: unknown) => ({
      kind: "advanced",
      layers: [singleLayer],
    });
    const layered = (singleLayer: unknown) => ({
      kind: "scene_layered",
      template: {
        sku: "SYNTHETIC",
        scene_id: 3,
        effect_id: 4,
        catalogue_schema_version: 1,
      },
      effect: { layers: [singleLayer] },
      speed_index: null,
      raw_param: "00",
    });
    const rejects = (value: unknown) => {
      try {
        decode(value);
        return false;
      } catch {
        return true;
      }
    };
    type DecodedLayer = {
      unknown_flags: number;
      selected_movement: { unknown_flags: number };
      overall_movement: { unknown_flags: number };
    };
    const reservedLayer = layer({
      unknown_flags: 0xfd,
      selected_movement: movement(0xe8),
      overall_movement: movement(0xe8),
    });
    // A decoded scene is its own wire content, so re-decoding proves the fields survive.
    const advancedRoundTrip = decode(
      decode(advanced(reservedLayer)),
    ) as { layers: DecodedLayer[] };
    const layeredRoundTrip = decode(
      decode(layered(reservedLayer)),
    ) as { effect: { layers: DecodedLayer[] } };
    return {
      advancedLayerReserved: advancedRoundTrip.layers[0].unknown_flags,
      advancedMovementReserved:
        advancedRoundTrip.layers[0].selected_movement.unknown_flags,
      layeredLayerReserved: layeredRoundTrip.effect.layers[0].unknown_flags,
      layeredMovementReserved:
        layeredRoundTrip.effect.layers[0].overall_movement.unknown_flags,
      advancedRejectsMovementKnownBit: rejects(
        advanced(layer({ selected_movement: movement(0x17) })),
      ),
      advancedRejectsLayerBrightnessBit: rejects(
        advanced(layer({ unknown_flags: 0x02 })),
      ),
      layeredRejectsMovementKnownBit: rejects(
        layered(layer({ overall_movement: movement(0x17) })),
      ),
      layeredRejectsLayerBrightnessBit: rejects(
        layered(layer({ unknown_flags: 0x02 })),
      ),
    };
  });

  expect(result.advancedLayerReserved).toBe(0xfd);
  expect(result.advancedMovementReserved).toBe(0xe8);
  expect(result.layeredLayerReserved).toBe(0xfd);
  expect(result.layeredMovementReserved).toBe(0xe8);
  expect(result.advancedRejectsMovementKnownBit).toBe(true);
  expect(result.advancedRejectsLayerBrightnessBit).toBe(true);
  expect(result.layeredRejectsMovementKnownBit).toBe(true);
  expect(result.layeredRejectsLayerBrightnessBit).toBe(true);
});

test("schema-only layout 1 remains structural and static", async ({ page }) => {
  await openStudio(page);
  const sceneBrowser = await openPaletteScene(
    page,
    "Synthetic schema-only",
    /Synthetic Layout 1/,
  );
  const preview = sceneBrowser.locator("govee-effect-preview");

  await expect(
    preview.getByRole("heading", {
      name: "Palette scene structure (schema-only layout 1)",
    }),
  ).toBeVisible();
  await expect(preview.getByText("Raw value 4660")).toBeVisible();
  await expect(preview.getByLabel("Step colour #010203")).toBeVisible();
  await expect(preview.getByLabel("Inline colour #040506")).toBeVisible();
  await expect(preview.getByRole("list", { name: "Preview palette" })).toHaveCount(0);
  await expect(
    preview.getByText("No hardware behaviour, timing, motion or animation is inferred."),
  ).toBeVisible();
  const animatedElements = await preview.locator("*").evaluateAll((elements) =>
    elements.filter(
      (element) => getComputedStyle(element).animationName !== "none",
    ).length,
  );
  expect(animatedElements).toBe(0);
});

test("scene Type 2 previews documented layer structure without geometry or animation", async ({
  page,
}) => {
  await openStudio(page);
  const sceneBrowser = await openLayeredScene(page);
  const preview = sceneBrowser.locator("govee-effect-preview");

  await expect(
    preview.getByRole("heading", { name: "Captured layered scene structure" }),
  ).toBeVisible();
  await expect(preview.getByText("Structural", { exact: true })).toBeVisible();
  await expect(preview.getByRole("article")).toHaveCount(2);
  await expect(
    preview.getByRole("img", {
      name: "Layer 1 applied area: start 0 tenths, width 10 tenths",
    }),
  ).toBeVisible();
  await expect(
    preview.getByRole("list", { name: "Preview palette" }),
  ).toHaveCount(2);
  await expect(
    preview.getByText(
      "No composite animation or physical LED geometry is inferred.",
    ),
  ).toBeVisible();
  await expect(preview.locator(".preview-cell, .scene-steps")).toHaveCount(0);
  expect(
    await preview.locator("*").evaluateAll((elements) =>
      elements.filter(
        (element) => getComputedStyle(element).animationName !== "none",
      ).length,
    ),
  ).toBe(0);
});

test("palette copies save losslessly, reload under Custom and cannot Apply", async ({
  page,
}) => {
  await openStudio(page);
  const sceneBrowser = await openPaletteScene(page, "Festival", /^Halloween/);
  const nativeApply = sceneBrowser.getByRole("button", { name: "Apply" });

  await expect(nativeApply).toBeEnabled();
  await nativeApply.click();
  await expect(
    sceneBrowser.getByRole("status").filter({ hasText: "Applied to Test strip" }),
  ).toBeVisible();
  await sceneBrowser.getByRole("button", { name: "Save copy" }).click();
  await expect(
    sceneBrowser.getByRole("status").filter({ hasText: "Custom scene saved." }),
  ).toBeVisible();

  const customApply = sceneBrowser.getByRole("button", { name: "Apply" });
  await expect(customApply).toBeDisabled();
  await expect(customApply).toHaveAttribute(
    "aria-describedby",
    "palette-apply-reason",
  );
  await expect(
    sceneBrowser.getByRole("note").filter({
      hasText: "Saved palette scene copies cannot be applied.",
    }),
  ).toBeVisible();
  await sceneBrowser.getByLabel("Scene name").fill("Halloween preserved");
  await sceneBrowser.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    sceneBrowser.getByRole("status").filter({ hasText: "Custom scene saved." }),
  ).toBeVisible();

  const beforeReload = await page.evaluate(() => {
    const snapshot = window.testHarness.snapshot();
    const item = Object.values(snapshot.state.items).find(
      (candidate) => candidate.name === "Halloween preserved",
    );
    return {
      content: item?.content,
      commands: snapshot.calls
        .map((call) => String(call.type))
        .filter((type) => type.endsWith("/scene/apply") || type.endsWith("/apply") || type.endsWith("/apply_snapshot")),
    };
  });
  expect(beforeReload.content).toEqual({
    kind: "scene_palette",
    template: {
      sku: "H617A",
      scene_id: 1041,
      effect_id: 1103,
      catalogue_schema_version: 1,
    },
    layout: 0,
    brightness_flag: true,
    steps: [
      { value: 5, colour: [255, 245, 0], inline_colour: null },
      { value: 5, colour: [255, 255, 255], inline_colour: null },
      { value: 5, colour: [255, 233, 255], inline_colour: null },
      { value: 5, colour: [255, 255, 255], inline_colour: null },
      { value: 5, colour: [255, 233, 217], inline_colour: null },
      { value: 6, colour: [255, 248, 255], inline_colour: null },
    ],
    palette: [
      [255, 30, 0],
      [255, 90, 0],
      [255, 50, 0],
      [255, 120, 0],
    ],
    speed_index: null,
  });
  expect(beforeReload.commands).toEqual([
    "ha_govee_led_ble/editor/scene/apply",
  ]);

  await page.reload();
  const studio = page.locator(studioSelector);
  await expect(
    studio.getByRole("heading", { name: "Effect Studio" }),
  ).toBeVisible();
  await studio.getByRole("button", { name: "Scenes", exact: true }).click();
  const reloadedBrowser = studio.locator("govee-scene-browser");
  await reloadedBrowser
    .getByRole("button", { name: "Custom", exact: true })
    .click();
  await reloadedBrowser.getByRole("button", { name: /Halloween preserved/ }).click();
  await expect(reloadedBrowser.getByText("Raw value 6")).toBeVisible();
  await expect(
    reloadedBrowser.getByRole("button", { name: "Apply" }),
  ).toBeDisabled();
});

test("a temporarily unavailable URL device is not reported as unsupported", async ({
  page,
}) => {
  const studio = await openStudio(
    page,
    "ha-govee-led-ble/editor/missing-entry",
  );

  await expect(
    studio.getByRole("status").filter({
      hasText:
        "This device is temporarily unavailable in Home Assistant. Apply is disabled until it is loaded.",
    }),
  ).toBeVisible();
  await expect(
    studio.getByText("Painted effects cannot be applied to this device."),
  ).toHaveCount(0);
  await expect(
    studio.locator(".editor").getByRole("button", { name: "Apply" }),
  ).toBeDisabled();
});

test("non-admin users receive a read-only editor", async ({ page }) => {
  const studio = await openStudio(page, "?admin=0");

  await expect(studio.getByLabel("Effect name")).toBeDisabled();
  await expect(
    studio.locator(".editor").getByRole("button", { name: "Save" }),
  ).toBeDisabled();
  await expect(
    studio.locator(".editor").getByRole("button", { name: "Apply" }),
  ).toBeDisabled();
  await expect(
    studio.getByRole("button", { name: "Segment 1, #2f6fed" }),
  ).toBeDisabled();
  await expect(
    studio.getByRole("note").filter({
      hasText: "An administrator is required to edit or apply them",
    }),
  ).toBeVisible();
  await expect(
    studio.getByRole("group", { name: "Create custom effect" }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(() => window.testHarness.snapshot().subscriptions),
  ).toEqual({
    library: {
      installs: 1,
      unsubscribes: 0,
      deliveries: 0,
      active: 1,
    },
    deployment: {
      installs: 0,
      unsubscribes: 0,
      deliveries: 0,
      active: 0,
    },
  });
});

test("non-admin users cannot inspect opaque library bodies", async ({
  page,
}) => {
  const studio = await openStudio(page, "?admin=0");

  await studio.getByRole("button", { name: "Advanced" }).click();
  await studio.getByRole("button", { name: "Future backend effect" }).click();

  await expect(
    studio.getByRole("status").filter({ hasText: "Unauthorized" }),
  ).toBeVisible();
  await expect(studio.getByLabel("Preserved opaque content")).toHaveCount(0);
  await expect(studio.getByRole("code")).toHaveCount(0);
  await expect(studio.getByText("opaque-summary-secret")).toHaveCount(0);
});

test("API mismatch renders only the fatal fallback", async ({ page }) => {
  await page.goto("/?apiMismatch=1");
  const studio = page.locator(studioSelector);

  await expect(
    studio.getByRole("heading", {
      name: "Effect Studio is unavailable",
    }),
  ).toBeVisible();
  await expect(studio.getByRole("alert")).toHaveText(
    "This editor bundle is not compatible with the installed backend.",
  );
  await expect(
    studio.getByRole("link", { name: "Open integration configuration" }),
  ).toHaveAttribute(
    "href",
    "/config/integrations/integration/ha_govee_led_ble",
  );
  await expect(
    studio.getByRole("heading", { name: "Effect Studio", exact: true }),
  ).toHaveCount(0);
  const subscriptions = await page.evaluate(
    () => window.testHarness.snapshot().subscriptions,
  );
  expect(subscriptions.library.installs).toBe(0);
  expect(subscriptions.deployment.installs).toBe(0);
});

test("malformed initial payloads fail closed before subscriptions", async ({
  page,
}) => {
  await page.goto("/?malformedLibrary=1");
  const studio = page.locator(studioSelector);

  await expect(
    studio.getByRole("heading", {
      name: "Effect Studio is unavailable",
    }),
  ).toBeVisible();
  await expect(studio.getByRole("alert")).toContainText(
    "Malformed Effect Studio server payload",
  );
  const subscriptions = await page.evaluate(
    () => window.testHarness.snapshot().subscriptions,
  );
  expect(subscriptions.library.active).toBe(0);
  expect(subscriptions.deployment.active).toBe(0);
});

test("partial subscription setup is rolled back on permission failure", async ({
  page,
}) => {
  await page.goto("/?rejectDeploymentSubscription=1");
  const studio = page.locator(studioSelector);

  await expect(
    studio.getByRole("heading", {
      name: "Effect Studio is unavailable",
    }),
  ).toBeVisible();
  await expect(studio.getByRole("alert")).toHaveText("Unauthorized");
  await expect
    .poll(async () =>
      page.evaluate(() => window.testHarness.snapshot().subscriptions),
    )
    .toEqual({
      library: {
        installs: 1,
        unsubscribes: 1,
        deliveries: 0,
        active: 0,
      },
      deployment: {
        installs: 0,
        unsubscribes: 0,
        deliveries: 0,
        active: 0,
      },
    });
});

test("malformed subscription events close every active subscription", async ({
  page,
}) => {
  const studio = await openStudio(page);

  await page.evaluate(() =>
    window.testHarness.backend.emitMalformedLibrary(),
  );
  await expect(
    studio.getByRole("heading", {
      name: "Effect Studio is unavailable",
    }),
  ).toBeVisible();
  await expect(studio.getByRole("alert")).toContainText(
    "Malformed Effect Studio server payload",
  );
  await expect
    .poll(async () =>
      page.evaluate(() => window.testHarness.snapshot().subscriptions),
    )
    .toEqual({
      library: {
        installs: 1,
        unsubscribes: 1,
        deliveries: 0,
        active: 0,
      },
      deployment: {
        installs: 1,
        unsubscribes: 1,
        deliveries: 0,
        active: 0,
      },
    });
});

test("stale subscription snapshots cannot roll back visible state", async ({
  page,
}) => {
  const studio = await openStudio(page);
  await studio
    .locator(".editor")
    .getByRole("button", { name: "Apply" })
    .click();
  await expect(
    studio.getByRole("status").filter({
      hasText: "Applied to Test strip.",
    }),
  ).toBeVisible();

  await page.evaluate(() => window.testHarness.backend.emitStaleSnapshots());

  await expect(
    studio.getByRole("button", { name: "Supported painted effect" }),
  ).toBeVisible();
  await expect(
    studio.getByRole("status").filter({
      hasText: "Applied to Test strip.",
    }),
  ).toBeVisible();
});

test("disconnect during initial load cannot install stale subscriptions", async ({
  page,
}) => {
  await page.goto("/?slowLoad=1");
  await page.evaluate(() => window.testHarness.disconnectEditor());
  await page.waitForTimeout(600);
  expect(
    await page.evaluate(() => window.testHarness.snapshot().subscriptions),
  ).toEqual({
    library: {
      installs: 0,
      unsubscribes: 0,
      deliveries: 0,
      active: 0,
    },
    deployment: {
      installs: 0,
      unsubscribes: 0,
      deliveries: 0,
      active: 0,
    },
  });

  await page.evaluate(() => window.testHarness.reconnectEditor());
  await expect(
    page
      .locator(studioSelector)
      .getByRole("heading", { name: "Effect Studio" }),
  ).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => window.testHarness.snapshot().subscriptions),
    )
    .toEqual({
      library: {
        installs: 1,
        unsubscribes: 0,
        deliveries: 0,
        active: 1,
      },
      deployment: {
        installs: 1,
        unsubscribes: 0,
        deliveries: 0,
        active: 1,
      },
    });
});

test("subscriptions cleanly uninstall and reload after reconnect", async ({
  page,
}) => {
  await openStudio(page);
  expect(
    await page.evaluate(() => window.testHarness.snapshot().subscriptions),
  ).toEqual({
    library: {
      installs: 1,
      unsubscribes: 0,
      deliveries: 0,
      active: 1,
    },
    deployment: {
      installs: 1,
      unsubscribes: 0,
      deliveries: 0,
      active: 1,
    },
  });

  await page.evaluate(() => window.testHarness.disconnectEditor());
  await expect(page.locator(studioSelector)).toHaveCount(0);
  await page.evaluate(() => {
    window.testHarness.backend.emitLibrary();
    window.testHarness.backend.emitDeployments();
  });
  expect(
    await page.evaluate(() => window.testHarness.snapshot().subscriptions),
  ).toEqual({
    library: {
      installs: 1,
      unsubscribes: 1,
      deliveries: 0,
      active: 0,
    },
    deployment: {
      installs: 1,
      unsubscribes: 1,
      deliveries: 0,
      active: 0,
    },
  });

  await page.evaluate(() => window.testHarness.reconnectEditor());
  const studio = page.locator(studioSelector);
  await expect(
    studio.getByRole("heading", { name: "Effect Studio" }),
  ).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(
        () => window.testHarness.snapshot().subscriptions.library.installs,
      ),
    )
    .toBe(2);
  await page.evaluate(() => {
    window.testHarness.backend.emitLibrary();
    window.testHarness.backend.emitDeployments();
  });
  await expect
    .poll(async () =>
      page.evaluate(() => window.testHarness.snapshot().subscriptions),
    )
    .toEqual({
      library: {
        installs: 2,
        unsubscribes: 1,
        deliveries: 1,
        active: 1,
      },
      deployment: {
        installs: 2,
        unsubscribes: 1,
        deliveries: 1,
        active: 1,
      },
    });
});

test("a second tab preserves dirty work when the library changes", async ({
  context,
  page,
}) => {
  const firstStudio = await openStudio(page);
  const secondPage = await context.newPage();
  const secondStudio = await openStudio(secondPage);

  await secondStudio.getByLabel("Effect name").fill("Tab two dirty work");
  await firstStudio.getByLabel("Effect name").fill("Tab one saved revision");
  await firstStudio.getByRole("button", { name: "Save" }).click();

  await expect(
    firstStudio.getByRole("status").filter({ hasText: "Saved." }),
  ).toBeVisible();
  await expect(
    secondStudio.getByRole("status").filter({
      hasText:
        "This effect changed elsewhere. Reload it before saving your draft.",
    }),
  ).toBeVisible();
  await expect(secondStudio.getByLabel("Effect name")).toHaveValue(
    "Tab two dirty work",
  );
  const savedName = await secondPage.evaluate(() => {
    const items = Object.values(window.testHarness.snapshot().state.items);
    return items.find((item) => item.id === "painted-1")?.name;
  });
  expect(savedName).toBe("Tab one saved revision");
});

test("two tabs fork a stale recovery draft instead of overwriting it", async ({
  context,
  page,
}) => {
  const firstStudio = await openStudio(page);
  await firstStudio.getByLabel("Effect name").fill("Shared draft");
  await expect
    .poll(async () =>
      page.evaluate(() =>
        Object.values(window.testHarness.snapshot().state.drafts).find(
          (draft) => draft.base_item_id === "painted-1",
        )?.item.name,
      ),
    )
    .toBe("Shared draft");

  const secondPage = await context.newPage();
  const secondStudio = await openStudio(secondPage);
  await expect(secondStudio.getByLabel("Effect name")).toHaveValue(
    "Shared draft",
  );

  await firstStudio.getByLabel("Effect name").fill("First tab draft");
  await expect
    .poll(async () =>
      page.evaluate(() =>
        Object.values(window.testHarness.snapshot().state.drafts).find(
          (draft) => draft.base_item_id === "painted-1",
        )?.item.name,
      ),
    )
    .toBe("First tab draft");

  await secondStudio.getByLabel("Effect name").fill("Second tab draft");
  await expect(
    secondStudio.getByRole("status").filter({
      hasText:
        "This draft changed elsewhere, so your work was saved as a separate recovery draft.",
    }),
  ).toBeVisible();
  const drafts = await secondPage.evaluate(() =>
    Object.values(window.testHarness.snapshot().state.drafts)
      .filter((draft) => draft.base_item_id === "painted-1")
      .map((draft) => draft.item.name)
      .sort(),
  );
  expect(drafts).toEqual(["First tab draft", "Second tab draft"]);
});

test("same-tab edits adopt an in-flight autosave revision without forking", async ({
  page,
}) => {
  const studio = await openStudio(page);
  await studio.getByLabel("Effect name").fill("Initial draft");
  await expect
    .poll(async () =>
      page.evaluate(() =>
        Object.values(window.testHarness.snapshot().state.drafts).find(
          (draft) => draft.base_item_id === "painted-1",
        )?.item.name,
      ),
    )
    .toBe("Initial draft");

  await page.evaluate(() =>
    window.testHarness.backend.delayNext("draft/update", 1000),
  );
  await studio.getByLabel("Effect name").fill("Delayed update");
  await expect
    .poll(async () =>
      page.evaluate(() =>
        window.testHarness
          .snapshot()
          .calls.filter(
            (call) =>
              call.type === "ha_govee_led_ble/editor/draft/update",
          ).length,
      ),
    )
    .toBe(1);
  await studio.getByLabel("Effect name").fill("Latest same-tab edit");

  await expect
    .poll(async () =>
      page.evaluate(() => {
        const drafts = Object.values(
          window.testHarness.snapshot().state.drafts,
        ).filter((draft) => draft.base_item_id === "painted-1");
        return {
          count: drafts.length,
          name: drafts[0]?.item.name,
        };
      }),
    )
    .toEqual({ count: 1, name: "Latest same-tab edit" });
  await expect(
    studio.getByRole("status").filter({
      hasText:
        "This draft changed elsewhere, so your work was saved as a separate recovery draft.",
    }),
  ).toHaveCount(0);
});

test("unfinished work recovers automatically without a draft manager", async ({
  page,
}) => {
  let studio = await openStudio(page);
  await studio.getByLabel("Effect name").fill("Restart recovery");
  await expect
    .poll(async () =>
      page.evaluate(() =>
        Object.values(window.testHarness.snapshot().state.drafts).find(
          (draft) => draft.base_item_id === "painted-1",
        )?.item.name,
      ),
    )
    .toBe("Restart recovery");

  await page.reload();
  studio = page.locator(studioSelector);
  await expect(studio.getByLabel("Effect name")).toHaveValue(
    "Restart recovery",
  );
  await expect(
    studio.getByRole("status").filter({
      hasText: "Recovered an unfinished draft.",
    }),
  ).toBeVisible();
  await expect(studio.getByText("Recovery drafts")).toHaveCount(0);
});

test("a delayed save cannot replace a newer dirty selection or delete its draft", async ({
  page,
}) => {
  const studio = await openStudio(page);

  await studio.getByRole("button", { name: "Zeta painted effect" }).click();
  await studio.getByLabel("Effect name").fill("B dirty work");
  await expect
    .poll(async () =>
      page.evaluate(() =>
        Object.values(window.testHarness.snapshot().state.drafts).find(
          (draft) => draft.base_item_id === "painted-2",
        )?.item.name,
      ),
    )
    .toBe("B dirty work");
  const bDraftId = await page.evaluate(() =>
    Object.values(window.testHarness.snapshot().state.drafts).find(
      (draft) => draft.base_item_id === "painted-2",
    )?.id,
  );
  expect(bDraftId).toBeTruthy();

  await studio
    .getByRole("button", { name: "Supported painted effect" })
    .click();
  await studio.getByLabel("Effect name").fill("A delayed save");
  await expect
    .poll(async () =>
      page.evaluate(() =>
        Object.values(window.testHarness.snapshot().state.drafts).find(
          (draft) => draft.base_item_id === "painted-1",
        )?.item.name,
      ),
    )
    .toBe("A delayed save");
  const aDraft = await page.evaluate(() =>
    Object.values(window.testHarness.snapshot().state.drafts).find(
      (draft) => draft.base_item_id === "painted-1",
    ),
  );
  expect(aDraft).toBeTruthy();
  await page.evaluate(() =>
    window.testHarness.backend.delayNext("library/update", 1000),
  );
  await studio
    .locator(".editor")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await expect
    .poll(async () =>
      page.evaluate(() =>
        window.testHarness
          .snapshot()
          .calls.filter(
            (call) =>
              call.type === "ha_govee_led_ble/editor/library/update",
          ).length,
      ),
    )
    .toBe(1);

  await studio.getByRole("button", { name: "Zeta painted effect" }).click();
  await expect(studio.getByLabel("Effect name")).toHaveValue("B dirty work");
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          window.testHarness.snapshot().state.items["painted-1"]?.name,
      ),
    )
    .toBe("A delayed save");

  await expect(studio.getByLabel("Effect name")).toHaveValue("B dirty work");
  await expect(
    studio.locator(".editor").getByRole("button", { name: "Save" }),
  ).toBeEnabled();
  await expect(studio.getByText("Recovery drafts")).toHaveCount(0);
  const finalState = await page.evaluate(() => window.testHarness.snapshot());
  expect(finalState.state.drafts[bDraftId!]?.item.name).toBe("B dirty work");
  const deleteCalls = finalState.calls.filter(
    (call) => call.type === "ha_govee_led_ble/editor/draft/delete",
  );
  expect(deleteCalls).toContainEqual(
    expect.objectContaining({
      draft_id: aDraft!.id,
      expected_revision: aDraft!.revision,
    }),
  );
  expect(deleteCalls.map((call) => call.draft_id)).not.toContain(bDraftId);
  await expect(
    studio.getByRole("status").filter({ hasText: "Saved." }),
  ).toHaveCount(0);
});

test("stale draft cleanup failure preserves the active notice and originating draft", async ({
  page,
}) => {
  const studio = await openStudio(page);

  await studio.getByRole("button", { name: "Zeta painted effect" }).click();
  await studio.getByLabel("Effect name").fill("B notice retained");
  await expect
    .poll(async () =>
      page.evaluate(() =>
        Object.values(window.testHarness.snapshot().state.drafts).find(
          (draft) => draft.base_item_id === "painted-2",
        )?.item.name,
      ),
    )
    .toBe("B notice retained");

  await studio
    .getByRole("button", { name: "Supported painted effect" })
    .click();
  await studio.getByLabel("Effect name").fill("A cleanup failure");
  await expect
    .poll(async () =>
      page.evaluate(() =>
        Object.values(window.testHarness.snapshot().state.drafts).find(
          (draft) => draft.base_item_id === "painted-1",
        )?.item.name,
      ),
    )
    .toBe("A cleanup failure");
  const aDraft = await page.evaluate(() =>
    Object.values(window.testHarness.snapshot().state.drafts).find(
      (draft) => draft.base_item_id === "painted-1",
    ),
  );
  expect(aDraft).toBeTruthy();
  await page.evaluate(() => {
    window.testHarness.backend.delayNext("library/update", 1000);
    window.testHarness.backend.failNext("draft/delete");
  });
  await studio
    .locator(".editor")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await expect
    .poll(async () =>
      page.evaluate(() =>
        window.testHarness
          .snapshot()
          .calls.filter(
            (call) =>
              call.type === "ha_govee_led_ble/editor/library/update",
          ).length,
      ),
    )
    .toBe(1);

  await studio.getByRole("button", { name: "Zeta painted effect" }).click();
  await expect(studio.getByLabel("Effect name")).toHaveValue(
    "B notice retained",
  );
  const status = studio.locator(".notice");
  await expect(status).toHaveText("Recovered an unfinished draft.");
  await expect
    .poll(async () =>
      page.evaluate(() =>
        window.testHarness
          .snapshot()
          .calls.filter(
            (call) =>
              call.type === "ha_govee_led_ble/editor/draft/delete",
          ).length,
      ),
    )
    .toBe(1);

  await expect(status).toHaveText("Recovered an unfinished draft.");
  await expect(studio.getByLabel("Effect name")).toHaveValue(
    "B notice retained",
  );
  await expect(studio.getByText("Recovery drafts")).toHaveCount(0);
  const finalState = await page.evaluate(() => window.testHarness.snapshot());
  expect(finalState.state.drafts[aDraft!.id]).toMatchObject({
    id: aDraft!.id,
    revision: aDraft!.revision,
    item: {
      name: "A cleanup failure",
    },
  });
});

test("save conflict keeps feedback when the library refresh fails", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const studio = await openStudio(page);

  await studio.getByLabel("Effect name").fill("Conflict edit");
  await page.evaluate(() => {
    window.testHarness.backend.conflictNext("library/update");
    window.testHarness.backend.failNext("library/list");
  });
  await studio
    .locator(".editor")
    .getByRole("button", { name: "Save", exact: true })
    .click();

  await expect(
    studio.getByRole("status").filter({
      hasText:
        "This effect or library changed elsewhere. Reload before saving.",
    }),
  ).toContainText("Library refresh failed: Injected library/list failure");
  await expect
    .poll(async () =>
      page.evaluate(() =>
        window.testHarness
          .snapshot()
          .calls.filter(
            (call) =>
              call.type === "ha_govee_led_ble/editor/library/list",
          ).length,
      ),
    )
    .toBe(2);
  await expect(
    studio.locator(".editor").getByRole("button", { name: "Save" }),
  ).toBeEnabled();
  await page.waitForTimeout(50);
  expect(pageErrors).toEqual([]);
});

test("advanced layer and palette keyboard focus follows edits", async ({
  page,
}) => {
  const studio = await openStudio(page);
  await studio.getByRole("button", { name: "Advanced" }).click();
  const advanced = studio.locator("govee-advanced-effect-editor");
  const layerTabs = advanced.getByRole("tab", { name: /Layer \d/ });

  await layerTabs.nth(0).focus();
  await layerTabs.nth(0).press("ArrowRight");
  await expect(layerTabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(layerTabs.nth(1)).toBeFocused();
  await layerTabs.nth(1).press("ArrowLeft");
  await expect(layerTabs.nth(0)).toHaveAttribute("aria-selected", "true");
  await expect(layerTabs.nth(0)).toBeFocused();

  const palette = advanced.locator("govee-palette-editor");
  let swatches = palette.getByRole("button", { name: /Edit colour/ });
  await swatches.nth(1).click();
  let dialog = palette.getByRole("dialog", { name: "Edit colour" });
  await dialog.getByRole("button", { name: "Move right" }).click();
  swatches = palette.getByRole("button", { name: /Edit colour/ });
  await expect(swatches.nth(2)).toBeFocused();
  dialog = palette.getByRole("dialog", { name: "Edit colour" });
  await dialog.getByRole("button", { name: "Remove" }).click();
  swatches = palette.getByRole("button", { name: /Edit colour/ });
  await expect(swatches).toHaveCount(2);
  await expect(swatches.nth(1)).toBeFocused();
});

test("unknown layered values stay raw and use a conservative preview", async ({
  page,
}) => {
  const studio = await openStudio(page);
  await studio.getByRole("button", { name: "Advanced" }).click();
  await studio.getByRole("button", { name: "Raw layered values" }).click();
  const advanced = studio.locator("govee-advanced-effect-editor");
  const selection = advanced.getByLabel("Selection type");
  const order = advanced.getByLabel("Brightness order");

  await expect(selection).toHaveValue("254");
  await expect(selection.locator("option:checked")).toHaveText(
    "Raw type 254 (0xFE)",
  );
  await expect(advanced.getByLabel("Type (raw byte)")).toHaveValue("254");
  await expect(order).toHaveValue("253");
  await expect(order.locator("option:checked")).toHaveText(
    "Raw order 253 (0xFD)",
  );
  await expect(advanced.getByLabel("Order (raw byte)")).toHaveValue("253");
  await expect(
    advanced.getByText(
      "Selection type 254 has unknown structure. Its raw parameters remain visible and no selected cells are inferred.",
    ),
  ).toBeVisible();
  await expect(advanced.getByText("0x20", { exact: true })).toBeVisible();
  await expect(
    advanced.getByText(
      "Selected movement flags remain visible without interpretation.",
    ),
  ).toBeVisible();
  await expect(advanced.locator(".preview-cell")).toHaveCount(0);
  await expect(
    advanced.getByRole("img", { name: /Layer 1 applied area/ }),
  ).toBeVisible();

  await advanced.getByRole("tab", { name: "Layer 2" }).click();
  await expect(
    advanced
      .getByRole("article")
      .filter({ hasText: "Layer 2 Selected" })
      .getByText(
        "Brightness order 253 has unknown structure. Its raw pattern remains visible and no brightness gradient is inferred.",
      ),
  ).toBeVisible();
  await expect(advanced.locator(".preview-cell")).toHaveCount(0);

  await studio.getByLabel("Effect name").fill("Raw values preserved");
  await expect
    .poll(async () =>
      page.evaluate(() =>
        window.testHarness
          .snapshot()
          .calls.filter(
            (call) =>
              call.type === "ha_govee_led_ble/editor/draft/create",
          ).length,
      ),
    )
    .toBe(1);
  const draftContent = await page.evaluate(() => {
    const calls = window.testHarness
      .snapshot()
      .calls.filter(
        (call) => call.type === "ha_govee_led_ble/editor/draft/create",
      );
    return calls.at(-1)?.content;
  });
  expect(draftContent).toMatchObject({
    kind: "advanced",
    layers: [
      expect.objectContaining({
        selection: expect.objectContaining({ type: 254 }),
        brightness_patterns: [
          expect.objectContaining({ order: 253 }),
        ],
      }),
      expect.objectContaining({
        brightness_patterns: [
          expect.objectContaining({ order: 253 }),
        ],
      }),
    ],
  });
});

test("opaque backend content is inspectable but cannot be edited or applied", async ({
  page,
}) => {
  const studio = await openStudio(page);
  await studio.getByRole("button", { name: "Advanced" }).click();
  await studio.getByRole("button", { name: "Future backend effect" }).click();

  await expect(
    studio.getByRole("heading", { name: "Future backend effect" }),
  ).toBeVisible();
  await expect(studio.getByRole("code")).toHaveText("future_wave");
  await expect(
    studio.getByLabel("Preserved opaque content"),
  ).toHaveText(JSON.stringify({
    schema: 7,
    enabled: false,
    template: {
      secret: "opaque-summary-secret",
    },
    nested: {
      mode: "prism",
      values: [1, null, "three"],
    },
  }, null, 2));
  await expect(
    studio.getByRole("note").filter({
      hasText:
        "This effect definition can be inspected, but this editor cannot change, save or apply it.",
    }),
  ).toBeVisible();
  await expect(studio.getByLabel("Effect name")).toHaveCount(0);
  await expect(
    studio.locator(".editor").getByRole("button", { name: "Save" }),
  ).toHaveCount(0);
  await expect(
    studio.locator(".editor").getByRole("button", { name: "Apply" }),
  ).toBeDisabled();
  await expect(
    studio.locator("govee-advanced-effect-editor"),
  ).toHaveCount(0);
});

test("opaque API adapters preserve wire content across every full-content path", async ({
  page,
}) => {
  await openStudio(page);
  const result = await page.evaluate(() =>
    window.testHarness.exerciseOpaqueAdapter(),
  );
  const publicContent = {
    kind: "opaque",
    source_kind: "future_wave",
    body: {
      schema: 7,
      enabled: false,
      template: {
        secret: "opaque-summary-secret",
      },
      nested: {
        mode: "prism",
        values: [1, null, "three"],
      },
    },
  };

  expect(result.loaded.content).toEqual(publicContent);
  expect(result.created.content).toEqual(publicContent);
  expect(result.updated.content).toEqual(publicContent);
  expect(result.fetchedDraft.item.content).toEqual(publicContent);
  expect(result.updatedDraft.item.content).toEqual(publicContent);
  expect(result.deployment).not.toHaveProperty("snapshot");
  expect(result.subscribedDeployment).not.toHaveProperty("snapshot");
  expect(result.knownKind).toBe("h617a_painted");
  expect(result.knownFirstChannel).toBe(0);

  const wireContent = {
    kind: "future_wave",
    schema: 7,
    enabled: false,
    template: {
      secret: "opaque-summary-secret",
    },
    nested: {
      mode: "prism",
      values: [1, null, "three"],
    },
  };
  const outgoing = await page.evaluate(() =>
    window.testHarness
      .snapshot()
      .calls.filter(
        (call) =>
          typeof call.name === "string" &&
          call.name.startsWith("Opaque adapter"),
      )
      .map((call) => ({
        command: call.type,
        content: call.content,
      })),
  );
  expect(outgoing).toEqual([
    {
      command: "ha_govee_led_ble/editor/library/create",
      content: wireContent,
    },
    {
      command: "ha_govee_led_ble/editor/library/update",
      content: wireContent,
    },
    {
      command: "ha_govee_led_ble/editor/draft/create",
      content: wireContent,
    },
    {
      command: "ha_govee_led_ble/editor/draft/update",
      content: wireContent,
    },
    {
      command: "ha_govee_led_ble/editor/apply_snapshot",
      content: wireContent,
    },
  ]);
});

test("empty layered scene imports remain inspectable and unchanged", async ({
  page,
}) => {
  const studio = await openStudio(page);
  const sceneBrowser = await openScene(page, "Focus", /Ocean Layers/);
  await sceneBrowser.getByRole("button", { name: "Use as template" }).click();
  const advanced = studio.locator("govee-advanced-effect-editor");

  await expect(
    advanced.getByRole("heading", { name: "No layer records" }),
  ).toBeVisible();
  await expect(
    advanced.getByRole("button", { name: "Add layer" }),
  ).toBeEnabled();
  await expect(
    advanced.getByRole("tablist", { name: "Effect layers" }),
  ).toHaveCount(0);
  await expect(
    studio.locator(".editor").getByRole("button", { name: "Apply" }),
  ).toBeDisabled();

  const draftContent = await page.evaluate(() => {
    const calls = window.testHarness
      .snapshot()
      .calls.filter(
        (call) => call.type === "ha_govee_led_ble/editor/draft/create",
      );
    return calls.at(-1)?.content;
  });
  expect(draftContent).toEqual({
    kind: "scene_layered",
    template: {
      sku: "H617A",
      scene_id: 2,
      effect_id: 202,
      catalogue_schema_version: 1,
    },
    effect: { layers: [] },
    speed_index: 1,
    raw_param: "102030405060708090a0b0c0",
  });
});

test("empty brightness pattern imports remain inspectable and unchanged", async ({
  page,
}) => {
  const studio = await openStudio(page);
  const sceneBrowser = await openScene(
    page,
    "Focus",
    /Empty Pattern Layers/,
  );
  await sceneBrowser.getByRole("button", { name: "Use as template" }).click();
  const advanced = studio.locator("govee-advanced-effect-editor");

  await expect(
    advanced.getByRole("heading", {
      name: "No brightness pattern records",
    }),
  ).toBeVisible();
  await expect(
    advanced.getByRole("button", { name: "Add brightness pattern" }),
  ).toBeEnabled();
  await expect(advanced.locator(".preview-cell")).toHaveCount(0);
  await expect(
    advanced.getByText("Brightness", { exact: true }).first(),
  ).toBeVisible();
  await expect(advanced.getByText("No pattern records")).toBeVisible();

  const draftContent = await page.evaluate(() => {
    const calls = window.testHarness
      .snapshot()
      .calls.filter(
        (call) => call.type === "ha_govee_led_ble/editor/draft/create",
      );
    return calls.at(-1)?.content;
  });
  expect(draftContent).toMatchObject({
    kind: "scene_layered",
    template: {
      sku: "H617A",
      scene_id: 3,
      effect_id: 303,
      catalogue_schema_version: 1,
    },
    effect: {
      layers: [
        expect.objectContaining({
          brightness_patterns: [],
        }),
      ],
    },
    raw_param: "102030405060708090a0b0c0",
  });
});

test("scene type-2 handoff round-trips and Back preserves scene state", async ({
  page,
}) => {
  const studio = await openStudio(page);
  const sceneBrowser = await openLayeredScene(page);
  await sceneBrowser.getByRole("button", { name: "Faster" }).click();
  await sceneBrowser.getByRole("button", { name: "Use as template" }).click();

  await expect(
    studio.getByText("Scene template opened as a recovery draft."),
  ).toBeVisible();
  const advancedApply = studio
    .locator(".editor")
    .getByRole("button", { name: "Apply" });
  await expect(advancedApply).toBeDisabled();
  await expect(
    studio.getByRole("note").filter({
      hasText: "Layered effects can be saved, but Apply is unavailable",
    }),
  ).toBeVisible();

  await studio.getByLabel("Effect name").fill("Aurora authored");
  await expect
    .poll(async () =>
      page.evaluate(() =>
        window.testHarness
          .snapshot()
          .calls.filter(
            (call) =>
              call.type === "ha_govee_led_ble/editor/draft/update",
          ).length,
      ),
    )
    .toBe(1);
  const draftContent = await page.evaluate(() => {
    const calls = window.testHarness
      .snapshot()
      .calls.filter(
        (call) => call.type === "ha_govee_led_ble/editor/draft/update",
      );
    return calls.at(-1)?.content;
  });
  expect(draftContent).toMatchObject({
    kind: "scene_layered",
    template: {
      sku: "H617A",
      scene_id: 1,
      effect_id: 101,
      catalogue_schema_version: 1,
    },
    speed_index: 2,
    raw_param: "aabbccddeeff001122334455",
    effect: {
      layers: expect.arrayContaining([
        expect.objectContaining({
          palette: [
            [255, 0, 0],
            [0, 255, 0],
            [0, 0, 255],
          ],
        }),
      ]),
    },
  });

  await studio.getByRole("button", { name: "Save" }).click();
  await expect(
    studio.getByRole("status").filter({ hasText: "Saved." }),
  ).toBeVisible();
  const savedContent = await page.evaluate(() => {
    const items = Object.values(window.testHarness.snapshot().state.items);
    return items.find((item) => item.name === "Aurora authored")?.content;
  });
  expect(savedContent).toEqual(draftContent);

  await studio.getByRole("button", { name: "Back to Scenes" }).click();
  await expect(
    sceneBrowser.getByRole("button", { name: "Nature" }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    sceneBrowser.getByRole("button", { name: /Aurora Layers/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    sceneBrowser.getByRole("button", { name: "Faster" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("a failed draft flush blocks Back navigation", async ({ page }) => {
  const studio = await openStudio(page);
  const sceneBrowser = await openLayeredScene(page);
  await sceneBrowser.getByRole("button", { name: "Use as template" }).click();
  await expect(
    studio.getByRole("button", { name: "Back to Scenes" }),
  ).toBeVisible();

  await studio.getByLabel("Effect name").fill("Unsaved blocked handoff");
  await page.evaluate(() =>
    window.testHarness.backend.failNext("draft/update"),
  );
  await studio.getByRole("button", { name: "Back to Scenes" }).click();

  await expect(
    studio.getByRole("status").filter({
      hasText:
        "The recovery draft could not be saved: Injected draft/update failure",
    }),
  ).toBeVisible();
  await expect(
    studio.getByRole("button", { name: "Back to Scenes" }),
  ).toBeVisible();
  await expect(
    studio.getByRole("button", { name: "Advanced" }),
  ).toHaveAttribute("aria-current", "page");
});

test("stale delayed scene detail responses are discarded", async ({ page }) => {
  const studio = await openStudio(page);
  await studio.getByRole("button", { name: "Scenes", exact: true }).click();
  const sceneBrowser = studio.locator("govee-scene-browser");
  await expect(
    sceneBrowser.getByRole("button", { name: /Aurora Layers/ }),
  ).toBeVisible();

  await sceneBrowser.getByRole("button", { name: /Aurora Layers/ }).click();
  await sceneBrowser.getByRole("button", { name: /Ocean Layers/ }).click();
  await expect(
    sceneBrowser.getByRole("heading", { name: "Ocean Layers" }),
  ).toBeVisible();
  await page.waitForTimeout(350);
  await expect(
    sceneBrowser.getByRole("heading", { name: "Ocean Layers" }),
  ).toBeVisible();
  await expect(
    sceneBrowser.getByRole("heading", { name: "Aurora Layers" }),
  ).toHaveCount(0);
  await expect(
    sceneBrowser.getByRole("button", { name: /Ocean Layers/ }),
  ).toHaveAttribute("aria-pressed", "true");
});

for (const direction of ["ltr", "rtl"] as const) {
  test(`390px ${direction.toUpperCase()} layout has no document overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const studio = await openStudio(
      page,
      direction === "rtl" ? "?rtl=1" : "",
    );
    await studio.getByRole("button", { name: "Advanced" }).click();
    await expect(
      studio.getByRole("note").filter({
        hasText: "Layered effects can be saved, but Apply is unavailable",
      }),
    ).toBeVisible();
    await expect(
      studio.getByRole("tablist", { name: "Effect layers" }),
    ).toBeVisible();
    await studio.getByRole("button", { name: "Scenes", exact: true }).click();
    const sceneBrowser = studio.locator("govee-scene-browser");
    await sceneBrowser
      .getByRole("button", { name: "Observed captures", exact: true })
      .click();
    await sceneBrowser.getByRole("button", { name: "Blue Sweep" }).click();
    await expect(
      sceneBrowser.getByRole("img", { name: /Capture-backed abstract directional sweep/ }),
    ).toBeVisible();
    const overflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      direction: document.documentElement.dir || "ltr",
    }));
    expect(overflow.direction).toBe(direction);
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });
}
