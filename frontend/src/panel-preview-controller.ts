import { EffectStudioApi } from "./api";
import {
  LivePreviewController,
  LivePreviewProgressController,
  type LivePreviewInteraction,
} from "./live-preview-controller";
import { PanelModel } from "./panel-model";
import { EffectStudioPreviewSession, scenePreviewRequest, snapshotPreviewRequest, type PanelPreviewRequest } from "./panel-preview";
import type { ScenePreviewRequest } from "./scene-browser";
import { isEditableEffectContent } from "./effect-editor-model";
import { errorCode, errorMessage } from "./ui-utils";
import type { PreviewStatus } from "./types";

export function previewStatusMessage(
  status: PreviewStatus | undefined,
): string | undefined {
  if (status === undefined || status.phase !== "failed") {
    return undefined;
  }
  switch (status.error_code) {
    case "transport_failed":
      return "Live apply could not reach the light. Tap Live to try again.";
    case "compilation_failed":
      return "Live apply could not prepare this effect.";
    case "storage_failed":
      return "The light changed, but its scene default could not be saved.";
    default:
      return "The latest Live change did not complete.";
  }
}

export class PanelPreviewController {
  private session?: EffectStudioPreviewSession;
  private readonly progress = new LivePreviewProgressController({
    changed: (visible) => {
      this.model.patch({ previewProgressVisible: visible });
    },
  });
  private readonly scheduler = new LivePreviewController<PanelPreviewRequest>({
    submit: (request) => {
      if (
        this.model.liveApplyEnabled &&
        request.configEntryId === this.model.selectedDeviceId
      ) {
        void this.session?.submit(request);
      }
    },
    cancel: () => {
      void this.cancel();
    },
  });

  public constructor(private readonly model: PanelModel) {}

  public async open(
    api: EffectStudioApi,
    subscriptionFailed: (error: Error) => void,
  ): Promise<boolean> {
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
          model.previewNotice = previewStatusMessage(status);
        });
      },
      subscriptionFailed,
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
      this.scheduler.reset();
    } else {
      this.scheduler.transition();
    }
    this.session?.transition();
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
    interaction: LivePreviewInteraction = "committed",
    scene?: ScenePreviewRequest,
  ): void {
    const request = this.currentRequest(false, scene);
    if (request) {
      this.scheduler.schedule(request, interaction);
    }
  }

  public scheduleTemplateSelection(): void {
    const request = this.currentRequest(false);
    if (request) {
      this.scheduler.scheduleSelection(request);
    }
  }

  public scheduleScene(request: ScenePreviewRequest): void {
    const deviceId = this.model.selectedDeviceId;
    if (!this.model.liveApplyEnabled || !deviceId) {
      return;
    }
    this.scheduler.schedule(
      scenePreviewRequest(request, deviceId, true),
      "committed",
    );
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
      this.scheduler.disable();
      return;
    }
    this.model.update((model) => {
      model.liveApplyEnabled = true;
    });
    this.scheduler.enable(this.currentRequest(true, scene));
  }

  public async cancel(): Promise<void> {
    const session = this.session;
    if (!session) {
      return;
    }
    try {
      await session.cancel(this.model.selectedDeviceId);
    } catch (error) {
      if (errorCode(error) !== "not_found") {
        this.model.update((model) => {
          model.notice = `Could not cancel Live: ${errorMessage(error)}`;
        });
      }
    }
  }

  public dispose(): void {
    this.scheduler.dispose();
    this.progress.reset();
    this.session?.close();
    this.session = undefined;
    this.model.update((model) => {
      model.previewStatus = undefined;
      model.previewNotice = undefined;
      model.previewProgressVisible = false;
    });
  }

  private currentRequest(
    force: boolean,
    scene?: ScenePreviewRequest,
  ): PanelPreviewRequest | undefined {
    if (!this.model.liveApplyEnabled || !this.model.selectedDeviceId) {
      return undefined;
    }
    if (this.model.section === "scenes") {
      return scene
        ? scenePreviewRequest(scene, this.model.selectedDeviceId, force)
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
      force,
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
