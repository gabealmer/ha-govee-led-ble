import { expect, test, type Locator, type Page } from "@playwright/test";

const studioSelector = "ha-govee-led-ble-editor";

async function openStudio(page: Page, query = "") {
  const path = query && !query.startsWith("?") ? `/${query}` : "/";
  const parameters = new URLSearchParams(
    query.startsWith("?") ? query.slice(1) : "",
  );
  parameters.set("fixtures", "1");
  await page.goto(`${path}?${parameters.toString()}`);
  const studio = page.locator(studioSelector);
  await expect(
    studio.getByRole("navigation", { name: "Create" }),
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
    sceneBrowser.getByRole("button", { name: "Edit", exact: true }),
  ).toBeEnabled();
  return sceneBrowser;
}

async function selectSavedPainted(studio: Locator) {
  await studio
    .getByRole("complementary", { name: "Effects" })
    .getByRole("button", { name: "Supported painted effect", exact: true })
    .click();
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
    sceneBrowser.getByText("Layout", { exact: true }),
  ).toBeVisible();
  return sceneBrowser;
}

async function dragAreaControlTo(
    page: Page,
    control: Locator,
    track: Locator,
    tenths: number,
) {
    const controlBox = await control.boundingBox();
    const trackBox = await track.boundingBox();
    if (!controlBox || !trackBox) {
      throw new Error("Applied area control is not visible.");
    }
    await page.mouse.move(
      controlBox.x + controlBox.width / 2,
      controlBox.y + controlBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      trackBox.x + (trackBox.width * tenths) / 10,
      controlBox.y + controlBox.height / 2,
      { steps: 8 },
    );
    await page.mouse.up();
}

async function dragAreaControlBy(
    page: Page,
    control: Locator,
    track: Locator,
    tenths: number,
) {
    const controlBox = await control.boundingBox();
    const trackBox = await track.boundingBox();
    if (!controlBox || !trackBox) {
      throw new Error("Applied area control is not visible.");
    }
    const startX = controlBox.x + controlBox.width / 2;
    const y = controlBox.y + controlBox.height / 2;
    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(
      startX + (trackBox.width * tenths) / 10,
      y,
      { steps: 8 },
    );
    await page.mouse.up();
}

test("default harness uses complete production H617A catalogues", async ({
  page,
}) => {
  await page.goto("/");
  const studio = page.locator(studioSelector);
  await expect(
    studio.getByRole("navigation", { name: "Create" }),
  ).toBeVisible();
  await expect(studio.locator("header.topbar")).toHaveCount(0);
  const devicePicker = studio
    .getByRole("navigation", { name: "Create" })
    .getByRole("combobox", { name: "Development device" });
  await expect(devicePicker).toBeVisible();
  await expect(devicePicker.locator("option")).toHaveText([
    "H617A LED Strip / H617A",
    "H6199 DreamView T1 / H6199",
  ]);
  await expect(
    studio
      .getByRole("navigation", { name: "Create" })
      .getByText("Device", { exact: true }),
  ).toHaveCount(0);
  await expect(
    studio.getByRole("navigation", { name: "Create" }).locator(":scope > :last-child"),
  ).toHaveClass(/device-picker/);
  await expect(
    studio.getByRole("navigation", { name: "Create" }).locator(".device-picker"),
  ).toHaveCSS("border-top-width", "0px");

  await studio.getByRole("button", { name: "Scenes", exact: true }).click();
  const sceneBrowser = studio.locator("govee-scene-browser");
  await expect(
    sceneBrowser.locator("aside.scenes").getByRole("button"),
  ).toHaveCount(83);
  await expect(sceneBrowser.locator("aside.scenes small")).toHaveCount(0);
  await expect(
    sceneBrowser.getByRole("button", { name: "Natural", exact: true }),
  ).toBeVisible();
  await expect(
    sceneBrowser.getByRole("button", { name: "Funny", exact: true }),
  ).toBeVisible();
  await expect(
    sceneBrowser
      .getByRole("complementary", { name: "Scene categories" })
      .getByRole("button"),
  ).toHaveText([
    "All scenes",
    "Emotion",
    "Festival",
    "Funny",
    "Life",
    "Natural",
  ]);
  await expect(
    sceneBrowser.getByText("No scenes in this category."),
  ).toHaveCount(0);
  const orderedSceneNames = await sceneBrowser
    .locator("aside.scenes button.scene > span:first-child")
    .allTextContents();
  expect(orderedSceneNames).toHaveLength(83);
  expect(orderedSceneNames.slice(0, 10)).toEqual([
    "Afternoon",
    "Aurora",
    "Aurora B",
    "Birthday",
    "Bloom",
    "Breathe",
    "Candlelight",
    "Candy",
    "Cheerful",
    "Cherry blossoms",
  ]);
  const sceneSearch = sceneBrowser.getByRole("searchbox", {
    name: "Search scenes",
  });
  await sceneSearch.fill("Bloom");
  await expect(
    sceneBrowser.locator("aside.scenes").getByRole("button"),
  ).toHaveText(["Bloom"]);
  await sceneSearch.fill("");

  await studio
    .getByRole("button", { name: "Effects", exact: true })
    .click();
  await expect(
    studio
      .getByRole("complementary", { name: "Effect categories" })
      .getByRole("button"),
  ).toHaveText([
    "New",
    "All",
    "Music",
    "Single Layer",
    "Multi Layer",
    "Advanced",
  ]);
  const categories = studio.getByRole("complementary", {
    name: "Effect categories",
  });
  const effectList = studio.getByRole("complementary", {
    name: "Effects",
  });
  await categories
    .getByRole("button", { name: "Single Layer", exact: true })
    .click();
  await expect(effectList.getByRole("button")).toHaveText([
    "Blinking",
    "Chase",
    "Fade",
    "Flow",
    "Jumping",
    "Marquee",
    "Paint",
    "Stream",
  ]);
  await categories
    .getByRole("button", { name: "Music", exact: true })
    .click();
  await expect(effectList.getByRole("button")).toHaveText([
    "Bloom",
    "Custom",
    "Day And Night",
    "Energetic",
    "Fountain",
    "Hopping",
    "Piano Keys",
    "Rhythm",
    "Rolling",
    "Separation",
    "Shiny",
    "Spectrum",
  ]);
  await effectList.getByRole("button", { name: "Bloom", exact: true }).click();
  const musicEditor = studio.locator("govee-music-profile-editor");
  await expect(musicEditor).toBeVisible();
  await expect(
    musicEditor.locator(".parameter-stack").first(),
  ).toHaveCSS("row-gap", "18px");
  await expect(
    studio
      .locator(".editor")
      .getByRole("heading", { name: "Bloom", exact: true }),
  ).toBeVisible();
  await expect(studio.locator(".editor-heading .eyebrow")).toHaveCount(0);
  await effectList
    .getByRole("button", { name: "Separation", exact: true })
    .click();
  await expect(
    musicEditor.getByRole("heading", { name: "Music profile" }),
  ).toHaveCount(0);
  await expect(
    musicEditor.getByRole("heading", { name: "Mode-specific controls" }),
  ).toHaveCount(0);
  await expect(musicEditor.locator(".mode-parameters")).toHaveCount(0);
  const musicParameterLabels = musicEditor.locator(
    ".parameter-stack > .range-field > .parameter-label, .parameter-stack > .parameter-group > .parameter-label, .parameter-stack > .check-field > .parameter-label",
  );
  await expect(musicParameterLabels).toHaveText([
    "Sensitivity",
    "Colour mode",
    "Point",
    "Gradient",
  ]);
  const musicLabelStyles = await musicParameterLabels.evaluateAll((labels) =>
    labels.map((label) => {
      const style = getComputedStyle(label);
      return `${style.fontSize}|${style.fontWeight}|${style.color}`;
    }),
  );
  expect(new Set(musicLabelStyles).size).toBe(1);
  const colourModeOptions = musicEditor
    .getByRole("group", { name: "Colour mode" })
    .getByRole("button");
  await expect(colourModeOptions).toHaveText(["Automatic", "Fixed"]);
  await expect(colourModeOptions.first()).toHaveCSS("font-size", "13px");
  await expect(colourModeOptions.first()).toHaveCSS("font-weight", "600");
  await categories
    .getByRole("button", { name: "All", exact: true })
    .click();
  await expect(
    effectList.getByRole("button", { name: "Fade", exact: true }),
  ).toBeVisible();
  await expect(
    effectList.getByRole("button", { name: "Mix", exact: true }),
  ).toBeVisible();
  await categories
    .getByRole("button", { name: "Single Layer", exact: true })
    .click();
  await effectList.getByRole("button", { name: "Paint", exact: true }).click();
  await expect(effectList.locator("small")).toHaveCount(0);
  await expect(
    effectList.getByRole("button", { name: "Unsupported special DIY pair" }),
  ).toHaveCount(0);
  await expect(
    studio
      .locator(".editor")
      .getByRole("heading", { name: "Paint", exact: true }),
  ).toBeVisible();
  await expect(studio.getByLabel("Effect name")).toHaveCount(0);
  await expect(
    studio.locator(".editor").getByRole("button", {
      name: "Save as Custom",
    }),
  ).toBeVisible();
  await expect(
    studio.getByRole("tablist", { name: "Custom effect type" }),
  ).toHaveCount(0);
  await expect(
    studio.getByRole("combobox", {
      name: "Effect",
      exact: true,
    }),
  ).toHaveCount(0);
  const variation = studio.getByRole("combobox", {
    name: "Variation",
    exact: true,
  });
  await expect(variation.locator("option")).toHaveText([
    "Cycle",
    "Clockwise",
    "Counterclockwise",
    "Twinkle",
    "Gradient",
    "Breathe",
  ]);
  await expect(variation).toHaveValue("clockwise");

  await effectList.getByRole("button", { name: "Fade", exact: true }).click();
  await expect(variation.locator("option")).toHaveText([
    "Whole strip",
    "Sections",
    "Cycle",
  ]);
  await expect(variation).toHaveValue("0");
  await expect(
    studio.locator("govee-painted-segment-editor"),
  ).toHaveCount(0);
  const speedParameters = studio.locator("govee-custom-effect-editor");
  await expect(
    speedParameters.locator(".parameter-stack"),
  ).toHaveCSS("row-gap", "18px");
  await expect(
    speedParameters.getByText("Speed", { exact: true }),
  ).toHaveCount(1);
  await expect(
    speedParameters.getByRole("heading", { name: "Parameters" }),
  ).toHaveCount(0);
  const paletteParameterLabels = speedParameters.locator(
    ".parameter-stack > .parameter-group > .parameter-label",
  );
  await expect(paletteParameterLabels).toHaveText([
    "Variation",
    "Colours",
    "Speed",
  ]);
  const paletteLabelStyles = await paletteParameterLabels.evaluateAll(
    (labels) =>
      labels.map((label) => {
        const style = getComputedStyle(label);
        return `${style.fontSize}|${style.fontWeight}|${style.color}`;
      }),
  );
  expect(new Set(paletteLabelStyles).size).toBe(1);
  await expect(
    speedParameters.getByRole("slider", { name: "Speed" }),
  ).toBeVisible();
  await expect(speedParameters.locator(".speed-group output")).toHaveText("50");
  await expect
    .poll(() =>
      speedParameters
        .locator(".speed-group")
        .evaluate((element) => getComputedStyle(element).borderTopStyle),
    )
    .toBe("none");

  await categories
    .getByRole("button", { name: "Music", exact: true })
    .click();
  await effectList.getByRole("button", { name: "Custom", exact: true }).click();
  await expect(
    studio.locator(".editor").getByRole("heading", { name: "Custom" }),
  ).toBeVisible();
  await expect(variation.locator("option")).toHaveText([
    "Rhythm",
    "Spectrum",
    "Rolling",
  ]);
  await expect(variation).toHaveValue("8");
  await expect(
    studio
      .locator("govee-custom-effect-editor")
      .getByText("Sensitivity", { exact: true }),
  ).toHaveCount(1);
  await studio
    .locator(".editor")
    .getByRole("button", { name: "Save as Custom" })
    .click();
  await expect(
    studio.getByRole("combobox", { name: "Effect", exact: true }),
  ).toHaveValue("music");

  await categories
    .getByRole("button", { name: "All", exact: true })
    .click();
  await effectList.getByRole("button", { name: "Paint", exact: true }).click();
  await expect(
    studio.locator("govee-painted-segment-editor"),
  ).toBeVisible();
  await expect(studio.getByRole("dialog")).toHaveCount(0);

  await devicePicker.selectOption("h6199-main");
  await studio.getByRole("button", { name: "Scenes", exact: true }).click();
  await expect(
    sceneBrowser.locator("aside.scenes").getByRole("button"),
  ).toHaveCount(240);
  await expect(
    sceneBrowser.getByRole("button", {
      name: "House of the Dragon",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    sceneBrowser.getByRole("button", { name: "Zootopia 2", exact: true }),
  ).toBeVisible();
});

test("templates become named custom effects only after Save as Custom", async ({
  page,
}) => {
  const studio = await openStudio(page);
  const categories = studio.getByRole("complementary", {
    name: "Effect categories",
  });

  await categories
    .getByRole("button", { name: "Single Layer", exact: true })
    .click();
  const effects = studio
    .getByRole("complementary", { name: "Effects" })
  const chase = effects.getByRole("button", { name: "Chase", exact: true });
  await chase.click();
  await expect(
    studio.getByRole("combobox", { name: "Effect", exact: true }),
  ).toHaveCount(0);
  await expect(
    studio.getByRole("combobox", { name: "Variation", exact: true }),
  ).toHaveCount(0);

  const flow = effects.getByRole("button", { name: "Flow", exact: true });
  await flow.click();

  await expect(
    categories.getByRole("button", { name: "Single Layer", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(flow).toHaveClass(/selected/);
  await expect(
    studio.locator(".editor").getByRole("heading", { name: "Flow" }),
  ).toBeVisible();
  await expect(studio.getByLabel("Effect name")).toHaveCount(0);
  await expect(
    studio.getByRole("combobox", { name: "Effect", exact: true }),
  ).toHaveCount(0);
  await expect(
    studio.getByRole("combobox", { name: "Variation", exact: true }),
  ).toHaveValue("9");
  await expect(
    studio.getByRole("tablist", { name: "Custom effect type" }),
  ).toHaveCount(0);
  const saveAsCustom = studio
    .locator(".editor")
    .getByRole("button", { name: "Save as Custom" });
  await saveAsCustom.click();
  await expect(flow).not.toHaveClass(/selected/);

  const name = studio.getByLabel("Effect name");
  await expect(name).toBeFocused();
  await expect(name).toHaveValue("Custom Flow");
  await expect
    .poll(() =>
      name.evaluate((input: HTMLInputElement) => ({
        start: input.selectionStart,
        end: input.selectionEnd,
      })),
    )
    .toEqual({ start: 0, end: "Custom Flow".length });
  await expect(
    studio.getByRole("tablist", { name: "Custom effect type" }),
  ).toHaveCount(0);
  await studio
    .locator(".editor")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await expect(
    studio.getByRole("tablist", { name: "Custom effect type" }),
  ).toHaveCount(0);
  await expect(
    categories.getByRole("button", { name: "Single Layer", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("Single and Multi variation selects track same-sized family changes", async ({
  page,
}) => {
  const studio = await openStudio(page);
  const categories = studio.getByRole("complementary", {
    name: "Effect categories",
  });

  await categories.getByRole("button", { name: "New", exact: true }).click();
  const types = studio.getByRole("tablist", { name: "Custom effect type" });
  const singleEffect = studio.getByRole("combobox", {
    name: "Effect",
    exact: true,
  });
  const singleVariation = studio.getByRole("combobox", {
    name: "Variation",
    exact: true,
  });

  await singleEffect.selectOption("paint");
  await expect(types).toBeVisible();
  await expect(types.getByRole("tab", { name: "Single" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await singleEffect.selectOption("fade");
  await singleEffect.selectOption("blinking");
  await expect(singleVariation).toHaveValue("0");
  await singleEffect.selectOption("stream");
  await expect(singleVariation).toHaveValue("9");
  await singleEffect.selectOption("flow");
  await expect(singleVariation).toHaveValue("9");

  await types.getByRole("tab", { name: "Multi" }).click();
  const multiEditor = studio.locator("govee-custom-effect-editor");
  const multiEffect = multiEditor.getByRole("combobox", { name: "Effect 1" });
  const multiVariation = multiEditor.getByRole("combobox", {
    name: "Variation 1",
  });
  await multiEffect.selectOption("marquee");
  await expect(multiVariation).toHaveValue("3");
  await multiEffect.selectOption("blinking");
  await expect(multiVariation).toHaveValue("0");
  await multiEffect.selectOption("stream");
  await expect(multiVariation).toHaveValue("9");
  await multiEffect.selectOption("flow");
  await expect(multiVariation).toHaveValue("9");
});

test("saved Painted effects retain their content kind", async ({ page }) => {
  const studio = await openStudio(page);
  await selectSavedPainted(studio);

  await expect(
    studio.getByRole("combobox", {
      name: "Effect",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    studio.getByRole("combobox", {
      name: "Variation",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    studio.locator("govee-painted-segment-editor"),
  ).toBeVisible();
});

test("custom catalogues reject families without variations", async ({
  page,
}) => {
  await openStudio(page);
  const rejected = await page.evaluate(() => {
    try {
      window.testHarness.backend.validateCustomCatalogue({
        schema_version: 1,
        sku: "H617A",
        painted_effects: [
          { id: "cycle", label: "Cycle" },
        ],
        effects: [
          {
            id: "empty",
            label: "Empty",
            family: 1,
            variations: [],
            supports_multi: false,
            rate: "speed",
          },
        ],
        limits: {
          palette_min: 1,
          palette_max: 8,
          multi_max: 4,
        },
        apply: {
          single: "supported",
          multi: "supported",
        },
      });
      return false;
    } catch {
      return true;
    }
  });

  expect(rejected).toBe(true);
});

test("unknown library models remain optional compatibility hints", async ({
  page,
}) => {
  await openStudio(page);
  const decoded = await page.evaluate(() =>
    window.testHarness.backend.validateLibrarySnapshot({
      library_revision: 1,
      items: [
        {
          id: "future-item",
          revision: 1,
          name: "Future",
          kind: "future_private",
          model: "future-model",
        },
      ],
    }),
  );

  expect(decoded.items).toEqual([
    {
      id: "future-item",
      revision: 1,
      name: "Future",
      kind: "future_private",
    },
  ]);
});

test("Painted effects keep multiple brushes and their picker visible", async ({
  page,
}) => {
  const studio = await openStudio(page);
  await selectSavedPainted(studio);
  const brushes = studio.locator("govee-palette-editor.paint-brushes");
  const brushTabs = brushes.getByRole("tab", { name: /^Brush / });

  await expect(brushTabs).toHaveCount(7);
  await expect(brushTabs.first()).toHaveAttribute("aria-selected", "true");
  await expect(
    brushes.getByRole("group", { name: "Edit brush 1" }),
  ).toBeVisible();

  await brushTabs.first().press("ArrowRight");
  await expect(brushTabs.nth(1)).toBeFocused();
  const picker = brushes.getByRole("group", { name: "Edit brush 2" });
  await expect(picker).toBeVisible();
  await picker.getByRole("button", { name: "Use #ff9f0a" }).click();
  await expect(picker).toBeVisible();
  await expect(
    brushes.getByRole("tab", { name: /Brush 2, #ff9f0a, selected/ }),
  ).toBeVisible();

  const firstSegment = studio
    .locator("govee-painted-segment-editor")
    .getByRole("button", { name: /^Segment 1,/ });
  await firstSegment.click();
  await expect(firstSegment).toHaveAccessibleName("Segment 1, #ff9f0a");
});

test("saved effects can be deleted from the editor", async ({
  page,
}) => {
  const studio = await openStudio(page);
  const effectList = studio.getByRole("complementary", {
    name: "Effects",
  });
  await selectSavedPainted(studio);
  const editorDelete = studio
    .locator(".editor-heading .actions")
    .getByRole("button", { name: "Delete", exact: true });

  await editorDelete.click();
  let dialog = studio.getByRole("dialog", { name: "Delete effect?" });
  await expect(dialog.getByText("Supported painted effect")).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(editorDelete).toBeFocused();
  await expect(
    effectList.getByRole("button", {
      name: "Delete Supported painted effect",
      exact: true,
    }),
  ).toHaveCount(0);

  await editorDelete.click();
  dialog = studio.getByRole("dialog", { name: "Delete effect?" });
  await dialog.getByRole("button", { name: "Delete effect" }).click();

  await expect(
    effectList.getByRole("button", {
      name: "Supported painted effect",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(studio.getByLabel("Effect name")).toHaveCount(0);
  await expect(
    studio.getByRole("status").filter({
      hasText: "Deleted Supported painted effect.",
    }),
  ).toBeVisible();
  const deleteCall = await page.evaluate(() =>
    window.testHarness
      .snapshot()
      .calls.find(
        (call) =>
          typeof call.type === "string" &&
          call.type.endsWith("/library/delete"),
      ),
  );
  expect(deleteCall).toMatchObject({
    item_id: "painted-1",
    expected_revision: 1,
    expected_library_revision: 1,
  });
});

test("capability gates Apply while retaining supported H617A custom Apply", async ({
  page,
}) => {
  const studio = await openStudio(page);

  await expect(
    studio.getByRole("navigation", { name: "Create" }),
  ).toBeVisible();
  await expect(
    studio.getByRole("tablist", { name: "Custom effect type" }),
  ).toHaveCount(0);
  const categories = studio.getByRole("complementary", {
    name: "Effect categories",
  });
  await categories.getByRole("button", { name: "New", exact: true }).click();
  const modes = studio.getByRole("tablist", { name: "Custom effect type" });
  await expect(modes.getByRole("tab", { name: "Single" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  const newEffect = studio.getByRole("combobox", {
    name: "Effect",
    exact: true,
  });
  await newEffect.selectOption("paint");
  await expect(modes).toBeVisible();
  await newEffect.selectOption("fade");
  await modes.getByRole("tab", { name: "Multi" }).click();
  await expect(modes.getByRole("tab", { name: "Multi" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await modes.getByRole("tab", { name: "Advanced" }).click();
  await expect(modes.getByRole("tab", { name: "Advanced" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await categories
    .getByRole("button", { name: "Single Layer", exact: true })
    .click();
  await studio
    .getByRole("complementary", { name: "Effects" })
    .getByRole("button", { name: "Paint", exact: true })
    .click();
  await expect(
    studio.getByRole("tablist", { name: "Custom effect type" }),
  ).toHaveCount(0);
  await expect(
    studio.locator(".editor").getByRole("button", {
      name: "Save as Custom",
    }),
  ).toBeVisible();
  await expect(
    studio
      .locator(".editor")
      .getByRole("heading", { name: "Paint", exact: true }),
  ).toBeVisible();
  await expect(
    studio.getByLabel("Effect name"),
  ).toHaveCount(
    0,
  );
  await expect(
    studio.locator(".editor").getByRole("button", { name: "Apply" }),
  ).toBeEnabled();
  await expect(
    studio.getByRole("button", { name: /^Segment 1,/ }),
  ).toBeEnabled();

  await categories
    .getByRole("button", { name: "Advanced", exact: true })
    .click();
  await studio
    .getByRole("complementary", { name: "Effects" })
    .getByRole("button", { name: "Layered", exact: true })
    .click();
  await expect(
    studio
      .locator(".editor")
      .getByRole("heading", { name: "Layered", exact: true }),
  ).toBeVisible();
  await expect(studio.locator(".editor-heading .eyebrow")).toHaveCount(0);
  const apply = studio
    .locator(".editor")
    .getByRole("button", { name: "Apply" });
  await expect(apply).toBeDisabled();
  await expect(apply).not.toHaveAttribute("aria-describedby");
  await expect(studio.locator("#advanced-apply-reason")).toHaveCount(0);
  await expect(
    studio.getByRole("tablist", { name: "Effect layers" }),
  ).toBeVisible();
  await expect(studio.getByRole("tabpanel")).toBeVisible();
  await expect(
    studio.getByRole("list", { name: "Colours" }),
  ).toBeVisible();
});

test("device catalogues expose complete model-specific effect families", async ({ page }) => {
  const studio = await openStudio(page);
  const devicePicker = studio.getByRole("combobox", {
    name: "Development device",
  });
  const categories = studio.getByRole("complementary", {
    name: "Effect categories",
  });
  const effects = studio.getByRole("complementary", { name: "Effects" });

  await categories
    .getByRole("button", { name: "Music", exact: true })
    .click();
  await effects.getByRole("button", { name: "Bloom", exact: true }).click();
  await expect(studio.getByRole("combobox", { name: "Mode" })).toHaveCount(0);
  await expect(
    studio.getByRole("slider", { name: "Sensitivity" }),
  ).toHaveAttribute("min", "0");
  await expect(
    studio.getByRole("slider", { name: "Sensitivity" }),
  ).toHaveAttribute("max", "99");
  await studio
    .locator(".editor")
    .getByRole("button", { name: "Save as Custom" })
    .click();
  await expect(studio.getByRole("combobox", { name: "Mode" })).toHaveValue(
    "bloom",
  );
  await devicePicker.selectOption("h6199-main");

  await expect(
    studio
      .getByRole("navigation", { name: "Create" })
      .getByRole("button"),
  ).toHaveText(["Video", "Scenes", "Effects"]);
  await expect(categories.getByRole("button")).toHaveText([
    "New",
    "All",
    "Music",
    "Single Layer",
    "Advanced",
  ]);
  await expect(studio.getByRole("combobox", { name: "Mode" })).toHaveCount(0);
  await expect(
    studio.getByRole("slider", { name: "Sensitivity" }),
  ).toHaveAttribute("min", "1");
  await expect(
    studio.getByRole("slider", { name: "Sensitivity" }),
  ).toHaveAttribute("max", "100");
  await expect(
    studio.locator(".editor").getByRole("heading", {
      name: "Energetic",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    categories.getByRole("button", { name: "Multi Layer", exact: true }),
  ).toHaveCount(0);
  await expect(
    categories.getByRole("button", { name: "My effects", exact: true }),
  ).toHaveCount(0);
  await effects.getByRole("button", { name: "Custom", exact: true }).click();
  await studio
    .locator(".editor")
    .getByRole("button", { name: "Save as Custom" })
    .click();
  await expect(
    studio.getByRole("combobox", { name: "Effect", exact: true }),
  ).toHaveValue("music");
  await categories
    .getByRole("button", { name: "Single Layer", exact: true })
    .click();
  await expect(effects.getByRole("button")).toHaveText([
    "Chasing",
    "Crossing",
    "Fade",
    "Jumping",
    "Marquee",
    "Rainbow",
    "Twinkle",
  ]);
  await effects.getByRole("button", { name: "Fade", exact: true }).click();
  await expect(
    studio.locator(".editor").getByRole("heading", {
      name: "Fade",
      exact: true,
    }),
  ).toBeVisible();
  await categories.getByRole("button", { name: "New", exact: true }).click();
  await expect(
    studio
      .getByRole("combobox", { name: "Effect", exact: true })
      .getByRole("option", { name: "Paint", exact: true }),
  ).toHaveCount(0);
  await expect(
    studio.getByRole("status").filter({
      hasText: "cannot be applied to this device",
    }),
  ).toHaveCount(0);
});

test("H6199 Video exposes complete reusable profile controls", async ({ page }) => {
  const studio = await openStudio(page);
  await studio
    .getByRole("combobox", { name: "Development device" })
    .selectOption("h6199-main");
  await studio.getByRole("button", { name: "Video", exact: true }).click();

  const profiles = studio.getByRole("complementary", {
    name: "Video profiles",
  });
  await expect(profiles.getByRole("button")).toHaveText(["Movie", "Game"]);
  await profiles.getByRole("button", { name: "Movie", exact: true }).click();

  const editor = studio.locator("govee-video-profile-editor");
  await expect(
    editor.getByRole("heading", { name: "Profile", exact: true }),
  ).toHaveCount(0);
  await expect(
    editor.locator(".parameter-stack").first(),
  ).toHaveCSS("row-gap", "18px");
  await expect(
    editor.getByRole("group", { name: "Mode" }),
  ).toHaveCount(0);
  await studio
    .locator(".editor")
    .getByRole("button", { name: "Save as Custom" })
    .click();
  await expect(
    editor.getByRole("group", { name: "Mode" }),
  ).toBeVisible();
  await expect(
    editor.getByRole("group", { name: "Capture area" }),
  ).toBeVisible();
  await expect(editor.getByRole("slider", { name: "Saturation" })).toBeVisible();
  await expect(
    editor.getByRole("slider", { name: "White balance" }),
  ).toBeVisible();
  await expect(
    editor.getByRole("status", { name: "White balance value" }),
  ).toHaveText("17");
  await expect(editor.locator(".endpoint-labels span")).toHaveText([
    "Cool",
    "Warm",
  ]);
  await expect(
    editor.getByRole("slider", { name: "Uniform brightness" }),
  ).toBeVisible();
  await expect(
    editor.getByRole("slider", { name: "Left", exact: true }),
  ).toBeVisible();
  await expect(
    editor.getByRole("slider", { name: "Top", exact: true }),
  ).toBeVisible();
  await expect(
    editor.getByRole("slider", { name: "Right", exact: true }),
  ).toBeVisible();
  await expect(
    editor.getByRole("slider", { name: "Bottom", exact: true }),
  ).toBeVisible();
  await expect(
    editor.getByRole("switch", { name: "Sound effects" }),
  ).toBeVisible();
  await expect(
    editor.getByRole("switch", { name: "Blank screen" }),
  ).toBeVisible();
});

test("Home Assistant mode omits the fixture device picker", async ({ page }) => {
  const studio = await openStudio(page, "?devicePicker=0");

  await expect(
    studio.getByRole("combobox", { name: "Development device" }),
  ).toHaveCount(0);
  await expect(
    studio.getByRole("heading", { name: "Effect Studio" }),
  ).toBeAttached();
});

test("palette scene parameters preserve decoded order", async ({
  page,
}) => {
  await openStudio(page);
  const halloween = await openPaletteScene(page, "Festival", /^Halloween/);

  await expect(
    halloween.getByRole("heading", { name: "Common settings" }),
  ).toHaveCount(0);
  await expect(
    halloween.getByRole("heading", { name: "Parameters" }),
  ).toHaveCount(0);
  await expect(halloween.getByText("Layout", { exact: true })).toBeVisible();
  await expect(halloween.getByText("0", { exact: true })).toBeVisible();
  await expect(halloween.getByText("Brightness flag")).toBeVisible();
  await expect(halloween.getByText("Set", { exact: true })).toBeVisible();
  await expect(halloween.getByText("Palette", { exact: true })).toBeVisible();
  await expect(halloween.getByText("Sequence", { exact: true })).toBeVisible();
  await expect(
    halloween
      .getByRole("list", { name: "Ordered scene steps" })
      .getByRole("listitem"),
  ).toHaveCount(6);
  await expect(halloween.getByText("Raw value 5")).toHaveCount(5);
  await expect(halloween.getByText("Raw value 6")).toHaveCount(1);
  await expect(
    halloween
      .getByRole("list", { name: "Scene palette" })
      .getByRole("listitem"),
  ).toHaveCount(4);
  await expect(halloween.getByLabel("Colour 1, #ff1e00")).toBeVisible();

  await halloween.getByRole("button", { name: "Life" }).click();
  await halloween.getByRole("button", { name: /^Sweet/ }).click();
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

test("schema-only layout 1 exposes decoded parameters", async ({ page }) => {
  await openStudio(page);
  const sceneBrowser = await openPaletteScene(
    page,
    "Synthetic schema-only",
    /Synthetic Layout 1/,
  );
  await expect(sceneBrowser.getByText("Raw value 4660")).toBeVisible();
  await expect(sceneBrowser.getByLabel("Step colour #010203")).toBeVisible();
  await expect(sceneBrowser.getByText("Inline colour #040506")).toBeVisible();
  await expect(
    sceneBrowser.getByRole("list", { name: "Scene palette" }),
  ).toHaveCount(0);
});

test("palette scenes copy on Edit, save losslessly and cannot Apply", async ({
  page,
}) => {
  await openStudio(page);
  const sceneBrowser = await openPaletteScene(page, "Festival", /^Halloween/);
  const nativeApply = sceneBrowser.getByRole("button", { name: "Apply" });
  const edit = sceneBrowser.getByRole("button", { name: "Edit" });

  await expect(nativeApply).toBeEnabled();
  await expect(nativeApply).toHaveClass("secondary");
  await expect(edit).toHaveClass("primary");
  await nativeApply.click();
  await expect(
    sceneBrowser
      .getByRole("status")
      .filter({ hasText: "Applied to H617A LED Strip" }),
  ).toBeVisible();
  await edit.click();
  await expect(sceneBrowser.getByLabel("Scene name")).toHaveValue(
    /Halloween.* copy/,
  );
  await sceneBrowser.getByRole("button", { name: "Save" }).click();
  await expect(
    sceneBrowser.getByRole("status").filter({ hasText: "Custom scene saved." }),
  ).toBeVisible();
  await expect(
    sceneBrowser.getByRole("button", { name: "Custom", exact: true }),
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
    studio.getByRole("navigation", { name: "Create" }),
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
  await selectSavedPainted(studio);

  await expect(
    studio.getByRole("status").filter({
      hasText:
        "This device is temporarily unavailable in Home Assistant. Apply is disabled until it is loaded.",
    }),
  ).toBeVisible();
  await expect(
    studio.getByText("Paint effects cannot be applied to this device."),
  ).toHaveCount(0);
  await expect(
    studio.locator(".editor").getByRole("button", { name: "Apply" }),
  ).toBeDisabled();
});

test("non-admin users receive a read-only editor", async ({ page }) => {
  const studio = await openStudio(page, "?admin=0");
  await selectSavedPainted(studio);

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

test("non-admin profile templates and controls remain read-only", async ({
  page,
}) => {
  const studio = await openStudio(page, "?admin=0");
  await studio
    .getByRole("combobox", { name: "Development device" })
    .selectOption("h6199-main");
  await studio.getByRole("button", { name: "Video", exact: true }).click();

  await expect(
    studio
      .getByRole("complementary", { name: "Video profiles" })
      .getByRole("button", { name: "Game", exact: true }),
  ).toBeDisabled();
  await expect(
    studio
      .locator("govee-video-profile-editor")
      .getByRole("button", { name: "Game", exact: true }),
  ).toHaveCount(0);
  await expect(
    studio
      .locator("govee-video-profile-editor")
      .getByRole("slider", { name: "Saturation" }),
  ).toBeDisabled();

  await studio.getByRole("button", { name: "Effects", exact: true }).click();
  await studio
    .getByRole("complementary", { name: "Effect categories" })
    .getByRole("button", { name: "Music", exact: true })
    .click();
  await expect(
    studio
      .getByRole("complementary", { name: "Effects" })
      .getByRole("button", { name: "Energetic", exact: true }),
  ).toBeDisabled();
});

test("non-admin users cannot inspect opaque library bodies", async ({
  page,
}) => {
  const studio = await openStudio(page, "?admin=0");

  await studio
    .getByRole("complementary", { name: "Effect categories" })
    .getByRole("button", { name: "Advanced", exact: true })
    .click();
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
  await selectSavedPainted(studio);
  await studio
    .locator(".editor")
    .getByRole("button", { name: "Apply" })
    .click();
  await expect(
    studio.getByRole("status").filter({
      hasText: "Applied to H617A LED Strip.",
    }),
  ).toBeVisible();

  await page.evaluate(() => window.testHarness.backend.emitStaleSnapshots());

  await expect(
    studio.getByRole("button", {
      name: "Supported painted effect",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    studio.getByRole("status").filter({
      hasText: "Applied to H617A LED Strip.",
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
      .getByRole("navigation", { name: "Create" }),
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
    studio.getByRole("navigation", { name: "Create" }),
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
  await selectSavedPainted(firstStudio);
  await selectSavedPainted(secondStudio);

  await secondStudio.getByLabel("Effect name").fill("Tab two dirty work");
  await firstStudio.getByLabel("Effect name").fill("Tab one saved revision");
  await firstStudio.getByRole("button", { name: "Save" }).click();

  await expect(
    firstStudio.getByRole("status").filter({ hasText: "Saved." }),
  ).toBeVisible();
  await expect(
    secondStudio.getByRole("status").filter({
      hasText:
        "This effect changed elsewhere. Reload it before saving.",
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

test("save conflict keeps feedback when the library refresh fails", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const studio = await openStudio(page);
  await selectSavedPainted(studio);

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
  await studio
    .getByRole("complementary", { name: "Effect categories" })
    .getByRole("button", { name: "Advanced", exact: true })
    .click();
  await studio
    .getByRole("complementary", { name: "Effects" })
    .getByRole("button", {
      name: "Layered library effect",
      exact: true,
    })
    .click();
  const advanced = studio.locator("govee-advanced-effect-editor");
  const layerTabs = advanced.getByRole("tab", { name: /Layer \d/ });
  const appliedArea = advanced.getByLabel("Applied area, 15 segments");

  await expect(appliedArea.locator("span")).toHaveCount(15);
  await expect(
    advanced.getByText("Selection", { exact: true }),
  ).toBeVisible();
  const areaTrack = advanced.locator(".area-track");
  const areaStart = advanced.getByRole("slider", {
    name: "Applied area start",
  });
  const areaEnd = advanced.getByRole("slider", {
    name: "Applied area end",
  });
  let moveArea = advanced.getByRole("button", {
    name: /^Move applied area/,
  });
  await expect(areaStart).toHaveAttribute("aria-valuenow", "0");
  await expect(areaEnd).toHaveAttribute("aria-valuenow", "10");

  await dragAreaControlTo(page, areaStart, areaTrack, 2);
  await expect(areaStart).toHaveAttribute("aria-valuenow", "2");
  await expect(areaEnd).toHaveAttribute("aria-valuenow", "10");
  const trackBox = await areaTrack.boundingBox();
  const startBox = await areaStart.boundingBox();
  if (!trackBox || !startBox) {
    throw new Error("Applied area track is not visible.");
  }
  expect(
    Math.abs(
      startBox.x +
        startBox.width / 2 -
        (trackBox.x + trackBox.width * 0.2),
    ),
  ).toBeLessThan(2);

  await dragAreaControlTo(page, areaEnd, areaTrack, 7);
  await expect(areaStart).toHaveAttribute("aria-valuenow", "2");
  await expect(areaEnd).toHaveAttribute("aria-valuenow", "7");

  await dragAreaControlBy(page, moveArea, areaTrack, 1);
  await expect(areaStart).toHaveAttribute("aria-valuenow", "3");
  await expect(areaEnd).toHaveAttribute("aria-valuenow", "8");

  await dragAreaControlTo(page, areaEnd, areaTrack, 6);
  await expect(areaStart).toHaveAttribute("aria-valuenow", "3");
  await expect(areaEnd).toHaveAttribute("aria-valuenow", "6");

  moveArea = advanced.getByRole("button", {
    name: /^Move applied area/,
  });
  await dragAreaControlBy(page, moveArea, areaTrack, -3);
  await expect(areaStart).toHaveAttribute("aria-valuenow", "0");
  await expect(areaEnd).toHaveAttribute("aria-valuenow", "3");
  await expect(appliedArea.locator("span.covered")).toHaveCount(5);

  await areaStart.press("ArrowRight");
  await expect(areaStart).toHaveAttribute("aria-valuenow", "1");
  await expect(areaEnd).toHaveAttribute("aria-valuenow", "3");
  moveArea = advanced.getByRole("button", {
    name: /^Move applied area/,
  });
  await moveArea.press("ArrowRight");
  await expect(areaStart).toHaveAttribute("aria-valuenow", "2");
  await expect(areaEnd).toHaveAttribute("aria-valuenow", "4");

  const selectionSegments = advanced.getByRole("spinbutton", {
    name: "Segments",
    exact: true,
  });
  await selectionSegments.fill("3");
  await expect(areaStart).toHaveAttribute("aria-valuenow", "2");
  await expect(areaEnd).toHaveAttribute("aria-valuenow", "4");

  await layerTabs.nth(1).click();
  await layerTabs.nth(1).press("ArrowLeft");
  await expect(layerTabs.nth(0)).toHaveAttribute("aria-selected", "true");
  await expect(layerTabs.nth(0)).toBeFocused();
  const layerActions = advanced.getByRole("dialog", {
    name: "Layer actions",
  });
  await expect(
    layerActions.getByRole("button", { name: "Copy layer" }),
  ).toBeVisible();
  await expect(
    layerActions.getByRole("button", { name: "Delete layer" }),
  ).toBeVisible();
  await expect(
    layerActions.getByRole("button", { name: "Move left" }),
  ).toHaveCount(0);
  await expect(
    layerActions.getByRole("button", { name: "Move right" }),
  ).toHaveCount(0);

  await layerTabs.nth(1).click();
  const palette = advanced.locator("govee-palette-editor");
  let swatches = palette.getByRole("button", { name: /Edit colour/ });
  await swatches.nth(1).focus();
  await swatches.nth(1).press("ArrowRight");
  swatches = palette.getByRole("button", { name: /Edit colour/ });
  await expect(swatches.nth(2)).toBeFocused();
  await swatches.nth(2).click();
  const dialog = palette.getByRole("dialog", { name: "Edit colour" });
  await expect(dialog.getByRole("button", { name: "Move left" })).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Move right" })).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Remove" })).toHaveCount(0);
  await expect(dialog.getByText("Custom colour")).toHaveCount(0);
  await palette.getByRole("button", { name: "Remove colour 3" }).click();
  swatches = palette.getByRole("button", { name: /Edit colour/ });
  await expect(swatches).toHaveCount(2);
  await expect(swatches.nth(1)).toBeFocused();
});

test("palette choices commit and close the colour picker", async ({ page }) => {
  const studio = await openStudio(page);
  await studio
    .getByRole("complementary", { name: "Effect categories" })
    .getByRole("button", { name: "New", exact: true })
    .click();
  const palette = studio
    .locator("govee-custom-effect-editor")
    .locator("govee-palette-editor");
  const firstSwatch = palette.getByRole("button", {
    name: /Edit colour 1/,
  });

  await firstSwatch.click();
  const dialog = palette.getByRole("dialog", { name: "Edit colour" });
  let presets = dialog.getByRole("button", { name: /^Use #/ });
  await expect(presets).toHaveCount(17);
  await expect(dialog.getByLabel("Custom colour")).toBeVisible();
  await expect(dialog.locator(".preset-grid > *")).toHaveCount(18);
  await expect(dialog.locator(".preset-grid > *").last()).toHaveClass(
    "custom-colour",
  );
  await presets.nth(1).click();

  await expect(dialog).toHaveCount(0);
  await expect(
    palette.getByRole("button", {
      name: /Edit colour 1, #ff9f0a/,
    }),
  ).toBeVisible();
  await palette.getByRole("button", { name: /Edit colour 1/ }).click();
  presets = palette
    .getByRole("dialog", { name: "Edit colour" })
    .getByRole("button", { name: /^Use #/ });
  await expect(presets.first()).toHaveAccessibleName("Use #ff9f0a");
});

test("unknown layered values stay raw", async ({
  page,
}) => {
  const studio = await openStudio(page);
  await studio
    .getByRole("complementary", { name: "Effect categories" })
    .getByRole("button", { name: "Advanced", exact: true })
    .click();
  await studio
    .getByRole("button", {
      name: "Raw layered values",
      exact: true,
    })
    .click();
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
  await advanced.getByText("Preserved wire values").click();
  await expect(advanced.getByLabel("Selected movement flags")).toHaveValue(
    "20",
  );

  await advanced.getByRole("tab", { name: "Layer 2" }).click();
  await expect(advanced.getByLabel("Brightness order")).toHaveValue("253");

  await studio.getByLabel("Effect name").fill("Raw values preserved");
  await studio.getByRole("button", { name: "Save" }).click();
  const savedContent = await page.evaluate(() => {
    const items = Object.values(window.testHarness.snapshot().state.items);
    return items.find((item) => item.name === "Raw values preserved")?.content;
  });
  expect(savedContent).toMatchObject({
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
  await studio
    .getByRole("complementary", { name: "Effect categories" })
    .getByRole("button", { name: "Advanced", exact: true })
    .click();
  await studio
    .getByRole("button", {
      name: "Future backend effect",
      exact: true,
    })
    .click();

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
  await sceneBrowser.getByRole("button", { name: "Edit", exact: true }).click();
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

  await studio.getByRole("button", { name: "Save" }).click();
  const savedContent = await page.evaluate(() => {
    const items = Object.values(window.testHarness.snapshot().state.items);
    return items.find((item) => item.name === "Ocean Layers copy")?.content;
  });
  expect(savedContent).toEqual({
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
  await sceneBrowser.getByRole("button", { name: "Edit", exact: true }).click();
  const advanced = studio.locator("govee-advanced-effect-editor");

  await expect(
    advanced.getByRole("heading", {
      name: "No brightness pattern records",
    }),
  ).toBeVisible();
  await expect(
    advanced.getByRole("button", { name: "Add brightness pattern" }),
  ).toBeEnabled();
  await studio.getByRole("button", { name: "Save" }).click();
  const savedContent = await page.evaluate(() => {
    const items = Object.values(window.testHarness.snapshot().state.items);
    return items.find(
      (item) => item.name === "Empty Pattern Layers copy",
    )?.content;
  });
  expect(savedContent).toMatchObject({
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
  await sceneBrowser.getByLabel("Scene speed").press("End");
  await sceneBrowser.getByRole("button", { name: "Edit", exact: true }).click();

  const advancedApply = studio
    .locator(".editor")
    .getByRole("button", { name: "Apply" });
  await expect(advancedApply).toBeDisabled();

  await studio.getByLabel("Effect name").fill("Aurora authored");
  await studio.getByRole("button", { name: "Save" }).click();
  await expect(
    studio.getByRole("status").filter({ hasText: "Saved." }),
  ).toBeVisible();
  const savedContent = await page.evaluate(() => {
    const items = Object.values(window.testHarness.snapshot().state.items);
    return items.find((item) => item.name === "Aurora authored")?.content;
  });
  expect(savedContent).toMatchObject({
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

  await studio.getByRole("button", { name: "Back to Scenes" }).click();
  await expect(
    sceneBrowser.getByRole("button", { name: "Nature" }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    sceneBrowser.getByRole("button", { name: /Aurora Layers/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    sceneBrowser.getByLabel("Scene speed"),
  ).toHaveValue("2");
});

test("Back navigation discards an unsaved scene template", async ({ page }) => {
  const studio = await openStudio(page);
  const sceneBrowser = await openLayeredScene(page);
  await sceneBrowser.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(
    studio.getByRole("button", { name: "Back to Scenes" }),
  ).toBeVisible();

  await studio.getByLabel("Effect name").fill("Unsaved handoff");
  await studio.getByRole("button", { name: "Back to Scenes" }).click();

  await expect(
    studio.getByRole("button", { name: "Scenes", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  const items = await page.evaluate(() =>
    Object.values(window.testHarness.snapshot().state.items),
  );
  expect(items.some((item) => item.name === "Unsaved handoff")).toBe(false);
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
    await studio
      .getByRole("complementary", { name: "Effect categories" })
      .getByRole("button", { name: "Advanced", exact: true })
      .click();
    await studio
      .getByRole("complementary", { name: "Effects" })
      .getByRole("button", { name: "Layered", exact: true })
      .click();
    await expect(
      studio.getByRole("tablist", { name: "Effect layers" }),
    ).toBeVisible();
    await studio.getByRole("button", { name: "Scenes", exact: true }).click();
    const sceneBrowser = studio.locator("govee-scene-browser");
    await expect(
      sceneBrowser.getByRole("complementary", { name: "Scene categories" }),
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
