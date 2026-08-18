import { expect, test } from "vitest";

import {
  LivePreviewController,
  type LivePreviewRequest,
} from "../../src/live-preview-controller";

interface Request extends LivePreviewRequest {
  value: number;
}

test("throttles changing values and always flushes the trailing value", () => {
  let now = 0;
  let nextTimer = 1;
  const timers = new Map<number, () => void>();
  const submitted: Request[] = [];
  const controller = new LivePreviewController<Request>({
    submit: (request) => submitted.push(request),
    cancel: () => undefined,
    now: () => now,
    setTimer: (callback) => {
      const id = nextTimer++;
      timers.set(id, callback);
      return id;
    },
    clearTimer: (id) => {
      timers.delete(id);
    },
  });

  controller.schedule({ fingerprint: "1", value: 1 }, "changing");
  now = 40;
  controller.schedule({ fingerprint: "2", value: 2 }, "changing");
  now = 80;
  controller.schedule({ fingerprint: "3", value: 3 }, "changing");

  expect(submitted.map((request) => request.value)).toEqual([1]);
  expect(timers.size).toBe(1);

  now = 280;
  [...timers.values()][0]();
  expect(submitted.map((request) => request.value)).toEqual([1, 3]);
  expect(submitted.map((request) => request.committed)).toEqual([
    undefined,
    true,
  ]);
});

test("committed changes flush immediately and suppress duplicates", () => {
  const submitted: Request[] = [];
  const controller = new LivePreviewController<Request>({
    submit: (request) => submitted.push(request),
    cancel: () => undefined,
  });

  controller.schedule({ fingerprint: "same", value: 1 }, "committed");
  controller.schedule({ fingerprint: "same", value: 1 }, "committed");
  controller.schedule({ fingerprint: "next", value: 2 }, "committed");

  expect(submitted.map((request) => request.value)).toEqual([1, 2]);
  expect(submitted.every((request) => request.committed)).toBe(true);
});

test("a settled single changing value is resubmitted as committed", () => {
  let nextTimer = 1;
  const timers = new Map<number, () => void>();
  const submitted: Request[] = [];
  const controller = new LivePreviewController<Request>({
    submit: (request) => submitted.push(request),
    cancel: () => undefined,
    now: () => 0,
    setTimer: (callback) => {
      const id = nextTimer++;
      timers.set(id, callback);
      return id;
    },
    clearTimer: (id) => {
      timers.delete(id);
    },
  });

  controller.schedule({ fingerprint: "same", value: 1 }, "changing");
  [...timers.values()][0]();

  expect(submitted).toEqual([
    { fingerprint: "same", value: 1 },
    { fingerprint: "same", value: 1, committed: true },
  ]);
});

test("toggle-on forces the current state and toggle-off cancels pending work", () => {
  const submitted: Request[] = [];
  let cancellations = 0;
  const controller = new LivePreviewController<Request>({
    submit: (request) => submitted.push(request),
    cancel: () => {
      cancellations += 1;
    },
  });

  controller.schedule({ fingerprint: "same", value: 1 }, "committed");
  controller.disable();
  controller.enable({ fingerprint: "same", value: 1 });

  expect(cancellations).toBe(1);
  expect(submitted).toEqual([
    { fingerprint: "same", value: 1, committed: true },
    { fingerprint: "same", value: 1, force: true, committed: true },
  ]);
});

test("reset disengages without changing the enabled preference", () => {
  let cancellations = 0;
  const controller = new LivePreviewController<Request>({
    submit: () => undefined,
    cancel: () => {
      cancellations += 1;
    },
  });

  controller.schedule({ fingerprint: "1", value: 1 }, "committed");
  controller.reset();

  expect(controller.enabled).toBe(true);
  expect(controller.engaged).toBe(false);
  expect(cancellations).toBe(1);
});

test("toggle-on without a current target still enables later edits", () => {
  const submitted: Request[] = [];
  const controller = new LivePreviewController<Request>({
    submit: (request) => submitted.push(request),
    cancel: () => undefined,
  });

  controller.disable();
  controller.enable();
  controller.schedule({ fingerprint: "later", value: 2 }, "committed");

  expect(controller.enabled).toBe(true);
  expect(submitted).toEqual([
    { fingerprint: "later", value: 2, committed: true },
  ]);
});
