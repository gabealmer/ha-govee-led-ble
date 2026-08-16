export type LivePreviewInteraction = "changing" | "committed";

export interface LivePreviewRequest {
  fingerprint: string;
  force?: boolean;
}

export interface LivePreviewControllerOptions<T extends LivePreviewRequest> {
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
  private trailingTimer?: number;
  private lastSubmittedAt = Number.NEGATIVE_INFINITY;
  private lastSubmittedFingerprint?: string;

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
    this.pending = request;
    if (interaction === "committed") {
      this.flush(true);
      return;
    }
    const elapsed = this.now() - this.lastSubmittedAt;
    if (elapsed >= this.throttleMs) {
      this.flush(false);
    }
    this.scheduleTrailing();
  }

  public enable(request?: T): void {
    this.enabled = true;
    this.engaged = request !== undefined;
    if (!request) {
      return;
    }
    this.pending = { ...request, force: true };
    this.flush(true);
  }

  public disable(): void {
    this.enabled = false;
    this.engaged = false;
    this.clearPending();
    this.cancelRequests();
  }

  public reset(): void {
    this.engaged = false;
    this.clearPending();
    this.lastSubmittedFingerprint = undefined;
    this.cancelRequests();
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
      this.flush(true);
    }, this.trailingMs);
  }

  private flush(forceTrailing: boolean): void {
    const request = this.pending;
    if (!request) {
      return;
    }
    if (
      !request.force &&
      request.fingerprint === this.lastSubmittedFingerprint
    ) {
      this.pending = undefined;
      return;
    }
    if (forceTrailing && this.trailingTimer !== undefined) {
      this.clearTimer(this.trailingTimer);
      this.trailingTimer = undefined;
    }
    this.pending = undefined;
    this.lastSubmittedAt = this.now();
    this.lastSubmittedFingerprint = request.fingerprint;
    this.submitRequest(request);
  }

  private clearPending(): void {
    this.pending = undefined;
    if (this.trailingTimer !== undefined) {
      this.clearTimer(this.trailingTimer);
      this.trailingTimer = undefined;
    }
  }
}
