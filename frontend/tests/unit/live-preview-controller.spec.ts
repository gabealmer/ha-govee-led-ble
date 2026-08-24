import { expect, test, vi } from "vitest";

import {
  LivePreviewController,
  LivePreviewProgressController,
  type LivePreviewRequest,
} from "../../src/live-preview-controller";
import type { EffectStudioApi } from "../../src/api";
import {
  EffectStudioPreviewSession,
  type PanelPreviewRequest,
} from "../../src/panel-preview";
import { previewStatusMessage } from "../../src/panel-preview-controller";
import type { PreviewStatus } from "../../src/types";

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

test("persistence intent is part of preview deduplication", () => {
  const submitted: Request[] = [];
  const controller = new LivePreviewController<Request>({
    submit: (request) => submitted.push(request),
    cancel: () => undefined,
  });

  controller.schedule(
    { fingerprint: "same", value: 1, persistDefault: false },
    "committed",
  );
  controller.schedule(
    { fingerprint: "same", value: 1, persistDefault: true },
    "committed",
  );

  expect(submitted).toHaveLength(2);
  expect(submitted.map((request) => request.persistDefault)).toEqual([
    false,
    true,
  ]);
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

test("selection transitions clear trailing work and dedupe without backend cancellation", () => {
  let now = 0;
  let nextTimer = 1;
  const timers = new Map<number, () => void>();
  const submitted: Request[] = [];
  let cancellations = 0;
  const controller = new LivePreviewController<Request>({
    submit: (request) => submitted.push(request),
    cancel: () => {
      cancellations += 1;
    },
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

  controller.schedule({ fingerprint: "old", value: 1 }, "changing");
  controller.transition();
  expect(timers.size).toBe(0);
  expect(cancellations).toBe(0);

  now = 200;
  controller.scheduleSelection({ fingerprint: "same", value: 2 });
  controller.transition();
  now = 400;
  controller.scheduleSelection({ fingerprint: "same", value: 2 });

  expect(submitted.map((request) => request.value)).toEqual([1, 2, 2]);
  expect(cancellations).toBe(0);
});

test("rapid explicit selections coalesce to the final committed request", () => {
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

  controller.scheduleSelection({ fingerprint: "first", value: 1 });
  now = 25;
  controller.scheduleSelection({ fingerprint: "second", value: 2 });
  now = 50;
  controller.scheduleSelection({ fingerprint: "third", value: 3 });

  expect(submitted.map((request) => request.value)).toEqual([1]);
  expect(timers.size).toBe(1);
  [...timers.values()][0]();
  expect(submitted.map((request) => request.value)).toEqual([1, 3]);
  expect(submitted.every((request) => request.committed)).toBe(true);
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

function status(
    sequence: number,
    phase: PreviewStatus["phase"],
    configEntryId = "entry-a",
  ): PreviewStatus {
    return {
      session_id: "session-a",
      sequence,
      config_entry_id: configEntryId,
      phase,
      content_kind: "advanced",
      confidence: "unknown",
      error_code: null,
      error_message: null,
      write_disposition: "unknown",
    };
}

test("shows progress only after five slow successful writes and a display delay", () => {
    let now = 0;
    let nextTimer = 1;
    const timers = new Map<number, () => void>();
    const visible: boolean[] = [];
    const progress = new LivePreviewProgressController({
      changed: (value) => visible.push(value),
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

    for (let sequence = 1; sequence <= 5; sequence += 1) {
      progress.accept(status(sequence, "queued"));
      now += 1_100;
      progress.accept(status(sequence, "written"));
    }

    progress.accept(status(6, "queued"));
    expect(visible).toEqual([]);
    expect(timers.size).toBe(1);
    [...timers.values()][0]();
    expect(visible).toEqual([true]);

    now += 1_100;
    progress.accept(status(6, "written"));
    expect(visible).toEqual([true, false]);
});

test("fast writes, failures, cancellation, and device changes clear delayed progress", () => {
    let now = 0;
    let nextTimer = 1;
    const timers = new Map<number, () => void>();
    const visible: boolean[] = [];
    const progress = new LivePreviewProgressController({
      changed: (value) => visible.push(value),
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

    for (let sequence = 1; sequence <= 5; sequence += 1) {
      progress.accept(status(sequence, "queued"));
      now += 1_200;
      progress.accept(status(sequence, "written"));
    }
    progress.accept(status(6, "queued"));
    expect(timers.size).toBe(1);
    progress.accept(status(6, "failed"));
    expect(timers.size).toBe(0);

    progress.accept(status(7, "queued"));
    progress.accept(status(7, "cancelled"));
    expect(timers.size).toBe(0);

    progress.accept(status(8, "queued", "entry-b"));
    expect(timers.size).toBe(0);
    expect(visible).toEqual([]);
});

test("writing without queued status does not create timing samples", () => {
    let now = 0;
    let nextTimer = 1;
    const timers = new Map<number, () => void>();
    const progress = new LivePreviewProgressController({
      changed: () => undefined,
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

    for (let sequence = 1; sequence <= 6; sequence += 1) {
      progress.accept(status(sequence, "writing"));
      now += 2_000;
      progress.accept(status(sequence, "written"));
    }

    progress.accept(status(7, "queued"));
    expect(timers.size).toBe(0);
});

test("editor transitions reject a late status when no successor request exists", async () => {
  let subscribed!: (status: PreviewStatus) => void;
  const api = {
    openPreviewSession: vi.fn().mockResolvedValue("session-a"),
    subscribePreview: vi.fn().mockImplementation(
      async (
        _sessionId: string,
        callback: (status: PreviewStatus) => void,
      ) => {
        subscribed = callback;
        return () => undefined;
      },
    ),
    closePreviewSession: vi.fn().mockResolvedValue(undefined),
    previewSnapshot: vi.fn().mockResolvedValue(undefined),
  } as unknown as EffectStudioApi;
  const statuses: (PreviewStatus | undefined)[] = [];
  const session = new EffectStudioPreviewSession(
    api,
    (value) => statuses.push(value),
    () => undefined,
  );
  await expect(session.open()).resolves.toBe(true);
  await session.submit({
    kind: "snapshot",
    configEntryId: "entry-a",
    name: "Preview",
    content: {
      kind: "h617a_single",
      family: 0,
      variant: 0,
      speed: 50,
      palette: [[255, 0, 0]],
    },
    fingerprint: "preview-a",
  } satisfies PanelPreviewRequest);
  const failed = {
    ...status(1, "failed"),
    error_code: "transport_failed",
  };

  subscribed(failed);
  session.transition();
  subscribed(failed);

  expect(statuses).toEqual([
    expect.objectContaining({ sequence: 1, phase: "queued" }),
    failed,
    undefined,
  ]);
});

test("preview failure messages distinguish failures from unconfirmed readback", () => {
  expect(
    previewStatusMessage({
      ...status(1, "failed"),
      error_code: "transport_failed",
    }),
  ).toBe("Live apply could not reach the light. Tap Live to try again.");
  expect(
    previewStatusMessage({
      ...status(2, "unconfirmed"),
      error_code: "device_state_mismatch",
    }),
  ).toContain("reported state did not match");
  expect(previewStatusMessage(status(3, "confirmed"))).toBeUndefined();
});
