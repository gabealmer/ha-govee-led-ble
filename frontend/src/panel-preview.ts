import { EffectStudioApi } from "./api";
import type { LivePreviewRequest } from "./live-preview-controller";
import type { ScenePreviewRequest } from "./scene-browser";
import type { EffectContent, PreviewStatus } from "./types";
import { errorCode } from "./ui-utils";

export type PanelPreviewRequest = LivePreviewRequest &
  (
    | {
        kind: "snapshot";
        configEntryId: string;
        name: string;
        content: EffectContent;
      }
    | {
        kind: "scene";
        configEntryId: string;
        scene: ScenePreviewRequest & { kind: "scene" };
      }
  );

export function snapshotPreviewRequest(
  configEntryId: string,
  name: string,
  content: EffectContent,
  force = false,
): PanelPreviewRequest {
  return {
    kind: "snapshot",
    configEntryId,
    name,
    content,
    fingerprint: JSON.stringify({ configEntryId, name, content }),
    force,
  };
}

export function scenePreviewRequest(
  request: ScenePreviewRequest,
  configEntryId: string,
  force = false,
): PanelPreviewRequest {
  if (request.kind !== "scene") {
    return snapshotPreviewRequest(
      configEntryId,
      request.name,
      request.content,
      force,
    );
  }
  return {
    kind: "scene",
    configEntryId,
    scene: request,
    fingerprint: JSON.stringify({
      configEntryId,
      sceneId: request.scene.scene_id,
      effectId: request.scene.effect_id,
      speedIndex: request.speedIndex,
    }),
    force,
  };
}

export class EffectStudioPreviewSession {
  private sessionId?: string;
  private sequence = 0;
  private generation = 0;
  private latestStatusSequence = 0;
  private unsubscribe?: () => void;

  public constructor(
    private readonly api: EffectStudioApi,
    private readonly statusChanged: (
      status: PreviewStatus | undefined,
    ) => void,
    private readonly subscriptionFailed: (error: Error) => void,
  ) {}

  public get ready(): boolean {
    return this.sessionId !== undefined;
  }

  public async open(): Promise<boolean> {
    const generation = this.generation;
    const sessionId = await this.api.openPreviewSession();
    if (generation !== this.generation) {
      await this.closeRemoteSession(sessionId);
      return false;
    }
    this.sessionId = sessionId;
    const unsubscribe = await this.api.subscribePreview(
      sessionId,
      (status) => this.acceptStatus(status),
      (error) => {
        if (
          generation === this.generation &&
          sessionId === this.sessionId
        ) {
          this.subscriptionFailed(error);
        }
      },
    );
    if (generation !== this.generation || sessionId !== this.sessionId) {
      unsubscribe();
      await this.closeRemoteSession(sessionId);
      return false;
    }
    this.unsubscribe = unsubscribe;
    return true;
  }

  public async submit(request: PanelPreviewRequest): Promise<void> {
    const sessionId = this.sessionId;
    if (!sessionId) {
      return;
    }
    const generation = this.generation;
    const sequence = ++this.sequence;
    this.acceptStatus({
      session_id: sessionId,
      sequence,
      config_entry_id: request.configEntryId,
      phase: "queued",
      content_kind:
        request.kind === "scene" ? "scene_builtin" : request.content.kind,
      confidence: "unknown",
      error_code: null,
    });
    try {
      if (request.kind === "scene") {
        await this.api.previewScene(
          sessionId,
          sequence,
          request.configEntryId,
          request.scene.scene,
          request.scene.speedIndex,
          request.force,
          request.persistDefault,
        );
      } else {
        await this.api.previewSnapshot(
          sessionId,
          sequence,
          request.configEntryId,
          request.name,
          request.content,
          request.force,
          request.persistDefault,
        );
      }
    } catch (error) {
      if (
        generation === this.generation &&
        sessionId === this.sessionId &&
        sequence >= this.latestStatusSequence
      ) {
        this.acceptStatus({
          session_id: sessionId,
          sequence,
          config_entry_id: request.configEntryId,
          phase: "failed",
          content_kind:
            request.kind === "scene" ? "scene_builtin" : request.content.kind,
          confidence: "unknown",
          error_code: errorCode(error) ?? "preview_failed",
        });
      }
    }
  }

  public async cancel(configEntryId?: string): Promise<void> {
    this.generation += 1;
    this.latestStatusSequence = this.sequence + 1;
    this.statusChanged(undefined);
    const sessionId = this.sessionId;
    if (sessionId) {
      await this.api.cancelPreview(sessionId, configEntryId);
    }
  }

  public transition(): void {
    this.latestStatusSequence = Math.max(
      this.latestStatusSequence,
      this.sequence + 1,
    );
    this.statusChanged(undefined);
  }

  public close(): void {
    this.generation += 1;
    this.statusChanged(undefined);
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    const sessionId = this.sessionId;
    this.sessionId = undefined;
    if (sessionId) {
      void this.closeRemoteSession(sessionId);
    }
  }

  private acceptStatus(status: PreviewStatus): void {
    if (
      status.session_id !== this.sessionId ||
      status.sequence < this.latestStatusSequence
    ) {
      return;
    }
    this.latestStatusSequence = status.sequence;
    this.statusChanged(status);
  }

  private async closeRemoteSession(sessionId: string): Promise<void> {
    try {
      await this.api.closePreviewSession(sessionId);
    } catch (error) {
      if (errorCode(error) !== "not_found") {
        console.warn("Could not close Effect Studio preview session", error);
      }
    }
  }
}
