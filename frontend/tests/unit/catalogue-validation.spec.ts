import { expect, test } from "vitest";

import backendContracts from "../fixtures/backend-contracts.json";
import { decodeCustomCataloguePayload } from "../../src/catalogue-validation";
import { decodeEffectContent } from "../../src/validation";

function decodeCatalogue(value: unknown) {
  return decodeCustomCataloguePayload(value, decodeEffectContent);
}

test("canonical backend catalogue decodes through the production catalogue validator", () => {
  const decoded = decodeCatalogue(
    backendContracts.responses.custom_catalogue,
  );
  expect(decoded.sku).toBe("H617A");
  expect(Object.keys(decoded.models)).toEqual(["H617A", "H6199"]);
});

test("catalogue families require variations and the single-layer category", () => {
  const noVariations = structuredClone(
    backendContracts.responses.custom_catalogue,
  );
  noVariations.effects[0].variations = [];
  noVariations.models.H617A.effects[0].variations = [];
  expect(() => decodeCatalogue(noVariations)).toThrow(
    "custom-effect template has no variations",
  );

  const wrongCategory = structuredClone(
    backendContracts.responses.custom_catalogue,
  );
  wrongCategory.effects[0].category = "music";
  wrongCategory.models.H617A.effects[0].category = "music";
  expect(() => decodeCatalogue(wrongCategory)).toThrow(
    "category is invalid",
  );
});

test("model catalogues require every release workflow", () => {
  const payload = structuredClone(
    backendContracts.responses.custom_catalogue,
  );
  payload.models.H6199.workflows = payload.models.H6199.workflows.filter(
    (workflow) => workflow.id !== "special_diy",
  );
  expect(() => decodeCatalogue(payload)).toThrow(
    "release workflows does not match H6199",
  );
});

test("catalogue keys and embedded template models must agree", () => {
  const wrongSku = structuredClone(
    backendContracts.responses.custom_catalogue,
  );
  wrongSku.models.H6199.sku = "H617A";
  expect(() => decodeCatalogue(wrongSku)).toThrow(
    "catalogue model H6199 is keyed as H6199 but declares H617A",
  );

  const wrongTemplateModel = structuredClone(
    backendContracts.responses.custom_catalogue,
  );
  wrongTemplateModel.models.H617A.workshop_templates[0].content.model = "H6199";
  expect(() => decodeCatalogue(wrongTemplateModel)).toThrow(
    "content does not target H617A",
  );
});
