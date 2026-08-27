import { EffectStudioApi } from "./api";
import {
  LivePreviewProgressController,
  type LivePreviewInteraction,
} from "./live-preview-controller";
import { PanelModel } from "./panel-model";
import {
  editorSnapshotProvenance,
  EffectStudioPreviewSession,
  scenePreviewRequest,
  snapshotPreviewRequest,
  type PanelPreviewRequest,
} from "./panel-preview";
import type { ScenePreviewRequest } from "./scene-browser";
import { isEditableEffectContent } from "./effect-editor-model";
import { errorCode, errorMessage } from "./ui-utils";
import type { PreviewStatus } from "./types";

export function previewStatusMessage(
  status: PreviewStatus | undefined,
): string | undefined {
  if (
    status === undefined ||
    (status.phase !== "failed" && status.phase !== "unconfirmed")
  ) {
    return undefined;
  }
  if (status.error_message) {
    return status.error_message;
  }
  switch (status.error_code) {
    case "transport_failed":
      return "Live apply could not reach the light. Turn Live off and on to try again.";
    case "compilation_failed":
      return "Live apply could not prepare this effect.";
    case "storage_failed":
      return "The light changed, but its scene default could not be saved.";
    case "device_state_mismatch":
      return "The light accepted the write, but its reported state did not match the requested change.";
    case "device_readback_unknown":
      return "The light accepted the write, but did not provide state readback to confirm it.";
    default:
      return "Effect Studio could not confirm whether the Live change completed.";
  }
}

export class PanelPreviewController {
  private session?: EffectStudioPreviewSession;
  private rejectedRequestSequence = 0;
  private readonly reportedPreviewErrors = new Set<string>();
  private readonly progress = new LivePreviewProgressController({
    changed: (visible) => {
      this.model.patch({ previewProgressVisible: visible });
    },
  });
  public constructor(private readonly model: PanelModel) {}

  public async open(
    api: EffectStudioApi,
    subscriptionFailed: (error: Error) => void,
  ): Promise<boolean> {
    this.reportedPreviewErrors.clear();
    const session = new EffectStudioPreviewSession(
      api,
      (status) => {
        if (
          status !== undefined &&
          status.config_entry_id !== this.model.selectedDeviceId
        ) {
          return;
        }
        if (status) {
          this.progress.accept(status);
        } else {
          this.progress.clear();
        }
        this.model.update((model) => {
          model.previewStatus = status;
          model.previewNotice = undefined;
        });
        const message = previewStatusMessage(status);
        if (message && status) {
          const key = `preview:${status.session_id}:${status.sequence}:${status.phase}:${status.error_code ?? ""}`;
          if (!this.reportedPreviewErrors.has(key)) {
            this.reportedPreviewErrors.add(key);
            this.model.reportError(message, {
              title: "Live change failed",
              key,
            });
          }
        }
      },
      subscriptionFailed,
      (error) => {
        this.progress.clear();
        this.model.patch({
          previewStatus: undefined,
          previewNotice: undefined,
          previewProgressVisible: false,
        });
        this.rejectedRequestSequence += 1;
        this.model.reportError(
          `Live request was not accepted: ${errorMessage(error)}`,
          {
            title: "Live request failed",
            key: `preview-rejected:${this.rejectedRequestSequence}`,
          },
        );
      },
    );
    this.session = session;
    this.progress.reset();
    const opened = await session.open();
    if (!opened || this.session !== session) {
      session.close();
      return false;
    }
    return true;
  }

  public beginEditorTransition(cancelBackend = true): number {
    const editorTransitionEpoch = this.model.editorTransitionEpoch + 1;
    if (cancelBackend) {
      void this.cancel();
    } else {
      this.session?.transition();
    }
    this.progress.clear();
    this.model.patch({
      editorTransitionEpoch,
      previewStatus: undefined,
      previewNotice: undefined,
      previewProgressVisible: false,
    });
    return editorTransitionEpoch;
  }

  public scheduleEdited(
    _interaction: LivePreviewInteraction = "committed",
    scene?: ScenePreviewRequest,
  ): void {
    const request = this.currentRequest(scene);
    if (request) {
      this.submit(request);
    }
  }

  public scheduleTemplateSelection(): void {
    const request = this.currentRequest();
    if (request) {
      this.submit(request);
    }
  }

  public scheduleScene(request: ScenePreviewRequest): void {
    const deviceId = this.model.selectedDeviceId;
    if (!this.model.liveApplyEnabled || !deviceId) {
      return;
    }
    this.submit(scenePreviewRequest(request, deviceId));
  }

  public toggle(scene?: ScenePreviewRequest): void {
    if (this.model.liveApplyEnabled) {
      this.model.update((model) => {
        model.liveApplyEnabled = false;
        model.previewStatus = undefined;
        model.previewNotice = undefined;
        model.previewProgressVisible = false;
      });
      this.progress.clear();
      void this.cancel();
      return;
    }
    this.model.update((model) => {
      model.liveApplyEnabled = true;
    });
    const request = this.currentRequest(scene);
    if (request) {
      this.submit(request);
    }
  }

  public async cancel(
    configEntryId = this.model.selectedDeviceId,
  ): Promise<void> {
    const session = this.session;
    if (!session) {
      return;
    }
    try {
      await session.cancel(configEntryId);
    } catch (error) {
      if (errorCode(error) !== "preview_session_not_found") {
        this.model.update((model) => {
          model.notice = `Could not cancel Live: ${errorMessage(error)}`;
        });
      }
    }
  }

  public dispose(): void {
    this.progress.reset();
    this.session?.close();
    this.session = undefined;
    this.reportedPreviewErrors.clear();
    this.model.update((model) => {
      model.previewStatus = undefined;
      model.previewNotice = undefined;
      model.previewProgressVisible = false;
    });
  }

  private submit(request: PanelPreviewRequest): void {
    if (
      this.model.liveApplyEnabled &&
      request.configEntryId === this.model.selectedDeviceId
    ) {
      this.session?.submit(request);
    }
  }

  private currentRequest(
    scene?: ScenePreviewRequest,
  ): PanelPreviewRequest | undefined {
    if (!this.model.liveApplyEnabled || !this.model.selectedDeviceId) {
      return undefined;
    }
    if (this.model.section === "scenes") {
      return scene
        ? scenePreviewRequest(scene, this.model.selectedDeviceId)
        : undefined;
    }
    if (
      !this.canPreview ||
      !this.model.editorOwnedByActiveView ||
      !isEditableEffectContent(this.model.content)
    ) {
      return undefined;
    }
    return snapshotPreviewRequest(
      this.model.selectedDeviceId,
      this.model.name.trim() || "Live preview",
      this.model.content,
      false,
      editorSnapshotProvenance(this.model.editorSource),
    );
  }

  private get canPreview(): boolean {
    return (
      isEditableEffectContent(this.model.content) &&
      this.model.isAdmin &&
      !this.model.deletingCurrentItem &&
      this.model.previewCapability === "supported" &&
      this.model.selectedDevice !== undefined &&
      this.session?.ready === true
    );
  }
}
