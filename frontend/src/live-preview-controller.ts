import type { PreviewStatus } from "./types";

export type LivePreviewInteraction = "changing" | "committed";

export interface LivePreviewRequest {
  fingerprint: string;
  force?: boolean;
  committed?: boolean;
  persistDefault?: boolean;
}

interface LivePreviewControllerOptions<T extends LivePreviewRequest> {
  submit: (request: T) => void;
  cancel: () => void;
  now?: () => number;
  setTimer?: (callback: () => void, delay: number) => number;
  clearTimer?: (timer: number) => void;
  throttleMs?: number;
  trailingMs?: number;
}

const DEFAULT_THROTTLE_MS = 150;
const DEFAULT_TRAILING_MS = 200;
const PREVIEW_DURATION_SAMPLE_COUNT = 5;
const SLOW_PREVIEW_AVERAGE_MS = 1_000;
const SLOW_PREVIEW_DISPLAY_DELAY_MS = 500;

interface LivePreviewProgressOptions {
  changed: (visible: boolean) => void;
  now?: () => number;
  setTimer?: (callback: () => void, delay: number) => number;
  clearTimer?: (timer: number) => void;
}

export class LivePreviewProgressController {
  private readonly changed: (visible: boolean) => void;
  private readonly now: () => number;
  private readonly setTimer: (callback: () => void, delay: number) => number;
  private readonly clearTimer: (timer: number) => void;
  private readonly durations: number[] = [];
  private starts = new Map<number, number>();
  private configEntryId?: string;
  private pendingSequence?: number;
  private displayTimer?: number;
  private visible = false;

  public constructor(options: LivePreviewProgressOptions) {
    this.changed = options.changed;
    this.now = options.now ?? (() => performance.now());
    this.setTimer =
      options.setTimer ??
      ((callback, delay) => window.setTimeout(callback, delay));
    this.clearTimer =
      options.clearTimer ?? ((timer) => window.clearTimeout(timer));
  }

  public accept(status: PreviewStatus): void {
    if (
      this.configEntryId !== undefined &&
      status.config_entry_id !== this.configEntryId
    ) {
      this.reset();
    }
    this.configEntryId = status.config_entry_id;
    if (status.phase === "queued") {
      for (const sequence of this.starts.keys()) {
        if (sequence < status.sequence) {
          this.starts.delete(sequence);
        }
      }
      this.starts.set(status.sequence, this.now());
      this.startPending(status.sequence);
      return;
    }
    if (status.phase === "writing") {
      this.startPending(status.sequence);
      return;
    }
    if (status.phase === "written") {
      const startedAt = this.starts.get(status.sequence);
      if (startedAt !== undefined) {
        this.durations.push(Math.max(0, this.now() - startedAt));
        if (this.durations.length > PREVIEW_DURATION_SAMPLE_COUNT) {
          this.durations.shift();
        }
      }
    }
    this.starts.delete(status.sequence);
    this.clearPending(status.sequence);
  }

  public clear(): void {
    if (this.pendingSequence !== undefined) {
      this.starts.delete(this.pendingSequence);
    }
    this.pendingSequence = undefined;
    this.clearDisplayTimer();
    this.setVisible(false);
  }

  public reset(): void {
    this.clear();
    this.configEntryId = undefined;
    this.starts = new Map();
    this.durations.splice(0);
  }

  private startPending(sequence: number): void {
    if (this.pendingSequence === sequence) {
      return;
    }
    this.pendingSequence = sequence;
    this.clearDisplayTimer();
    this.setVisible(false);
    if (!this.progressIsUseful) {
      return;
    }
    this.displayTimer = this.setTimer(() => {
      this.displayTimer = undefined;
      if (this.pendingSequence === sequence) {
        this.setVisible(true);
      }
    }, SLOW_PREVIEW_DISPLAY_DELAY_MS);
  }

  private clearPending(sequence: number): void {
    if (this.pendingSequence !== sequence) {
      return;
    }
    this.clear();
  }

  private clearDisplayTimer(): void {
    if (this.displayTimer !== undefined) {
      this.clearTimer(this.displayTimer);
      this.displayTimer = undefined;
    }
  }

  private setVisible(visible: boolean): void {
    if (this.visible === visible) {
      return;
    }
    this.visible = visible;
    this.changed(visible);
  }

  private get progressIsUseful(): boolean {
    return (
      this.durations.length === PREVIEW_DURATION_SAMPLE_COUNT &&
      this.durations.reduce((total, duration) => total + duration, 0) /
        PREVIEW_DURATION_SAMPLE_COUNT >
        SLOW_PREVIEW_AVERAGE_MS
    );
  }
}

export class LivePreviewController<T extends LivePreviewRequest> {
  public enabled = true;
  public engaged = false;

  private readonly submitRequest: (request: T) => void;
  private readonly cancelRequests: () => void;
  private readonly now: () => number;
  private readonly setTimer: (callback: () => void, delay: number) => number;
  private readonly clearTimer: (timer: number) => void;
  private readonly throttleMs: number;
  private readonly trailingMs: number;
  private pending?: T;
  private settling?: T;
  private trailingTimer?: number;
  private lastSubmittedAt = Number.NEGATIVE_INFINITY;
  private lastSubmittedKey?: string;

  public constructor(options: LivePreviewControllerOptions<T>) {
    this.submitRequest = options.submit;
    this.cancelRequests = options.cancel;
    this.now = options.now ?? (() => performance.now());
    this.setTimer =
      options.setTimer ??
      ((callback, delay) => window.setTimeout(callback, delay));
    this.clearTimer =
      options.clearTimer ?? ((timer) => window.clearTimeout(timer));
    this.throttleMs = options.throttleMs ?? DEFAULT_THROTTLE_MS;
    this.trailingMs = options.trailingMs ?? DEFAULT_TRAILING_MS;
  }

  public schedule(request: T, interaction: LivePreviewInteraction): void {
    if (!this.enabled) {
      return;
    }
    this.engaged = true;
    this.pending =
      interaction === "committed"
        ? { ...request, committed: true }
        : request;
    if (interaction === "committed") {
      this.settling = undefined;
      this.flush(true);
      return;
    }
    this.settling = request;
    const elapsed = this.now() - this.lastSubmittedAt;
    if (elapsed >= this.throttleMs) {
      this.flush(false);
    }
    this.scheduleTrailing();
  }

  public scheduleSelection(request: T): void {
    if (!this.enabled) {
      return;
    }
    this.engaged = true;
    this.pending = { ...request, committed: true };
    this.settling = undefined;
    const elapsed = this.now() - this.lastSubmittedAt;
    if (elapsed >= this.throttleMs) {
      this.flush(true);
      return;
    }
    if (this.trailingTimer !== undefined) {
      this.clearTimer(this.trailingTimer);
    }
    this.trailingTimer = this.setTimer(() => {
      this.trailingTimer = undefined;
      this.flush(true);
    }, this.throttleMs - elapsed);
  }

  public enable(request?: T): void {
    this.enabled = true;
    this.engaged = request !== undefined;
    if (!request) {
      return;
    }
    this.pending = { ...request, force: true, committed: true };
    this.flush(true);
  }

  public disable(): void {
    this.enabled = false;
    this.engaged = false;
    this.clearPending();
    this.cancelRequests();
  }

  public reset(): void {
    this.transition();
    this.cancelRequests();
  }

  public transition(): void {
    this.engaged = false;
    this.clearPending();
    this.lastSubmittedKey = undefined;
  }

  public dispose(): void {
    this.clearPending();
  }

  private scheduleTrailing(): void {
    if (this.trailingTimer !== undefined) {
      this.clearTimer(this.trailingTimer);
    }
    this.trailingTimer = this.setTimer(() => {
      this.trailingTimer = undefined;
      const request = this.pending ?? this.settling;
      this.settling = undefined;
      if (request) {
        this.pending = { ...request, committed: true };
      }
      this.flush(true);
    }, this.trailingMs);
  }

  private flush(forceTrailing: boolean): void {
    const request = this.pending;
    if (!request) {
      return;
    }
    const requestKey = `${request.fingerprint}:${request.committed === true ? "committed" : "changing"}:${request.persistDefault === true ? "persist" : "preview"}`;
    if (!request.force && requestKey === this.lastSubmittedKey) {
      this.pending = undefined;
      return;
    }
    if (forceTrailing && this.trailingTimer !== undefined) {
      this.clearTimer(this.trailingTimer);
      this.trailingTimer = undefined;
    }
    this.pending = undefined;
    if (request.committed) {
      this.settling = undefined;
    }
    this.lastSubmittedAt = this.now();
    this.lastSubmittedKey = requestKey;
    this.submitRequest(request);
  }

  private clearPending(): void {
    this.pending = undefined;
    this.settling = undefined;
    if (this.trailingTimer !== undefined) {
      this.clearTimer(this.trailingTimer);
      this.trailingTimer = undefined;
    }
  }
}
