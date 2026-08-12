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

test("capability gates Apply while retaining supported H617A custom Apply", async ({
  page,
}) => {
  const studio = await openStudio(page);

  await expect(
    studio.getByRole("navigation", { name: "Create" }),
  ).toBeVisible();
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
  await expect(
    studio.getByRole("button", { name: "B dirty work" }),
  ).toBeVisible();
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
  await expect(
    studio.getByRole("button", {
      name: "A cleanup failure Painted draft",
    }),
  ).toBeVisible();
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
      "Selection type 254 has unknown structure, so no selected cells are previewed.",
    ),
  ).toBeVisible();
  await expect(advanced.locator(".preview-cell")).toHaveCount(15);
  await expect(advanced.locator(".preview-cell.active")).toHaveCount(0);

  await advanced.getByRole("tab", { name: "Layer 2" }).click();
  await expect(
    advanced.getByText(
      "Brightness order 253 has unknown structure, so gradient brightness is not previewed.",
    ),
  ).toBeVisible();
  await expect(advanced.locator(".preview-cell.active")).toHaveCount(0);

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
  await expect(advanced.locator(".preview-cell")).toHaveCount(15);
  await expect(advanced.locator(".preview-cell.active")).toHaveCount(0);

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
    const overflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      direction: document.documentElement.dir || "ltr",
    }));
    expect(overflow.direction).toBe(direction);
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });
}
