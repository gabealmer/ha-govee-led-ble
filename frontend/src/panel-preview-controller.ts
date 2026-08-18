import { EffectStudioApi } from "./api";
import { LivePreviewController, type LivePreviewInteraction } from "./live-preview-controller";
import { PanelModel } from "./panel-model";
import { EffectStudioPreviewSession, scenePreviewRequest, snapshotPreviewRequest, type PanelPreviewRequest } from "./panel-preview";
import type { ScenePreviewRequest } from "./scene-browser";
import { isEditableEffectContent } from "./effect-editor-model";
import { errorCode, errorMessage } from "./ui-utils";

export class PanelPreviewController {
  private session?: EffectStudioPreviewSession;
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
        this.model.update((model) => {
          model.previewStatus = status;
        });
      },
      subscriptionFailed,
    );
    this.session = session;
    const opened = await session.open();
    if (!opened || this.session !== session) {
      session.close();
      return false;
    }
    return true;
  }

  public beginEditorTransition(): number {
    const editorTransitionEpoch = this.model.editorTransitionEpoch + 1;
    this.scheduler.reset();
    this.model.patch({ editorTransitionEpoch, previewStatus: undefined });
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
      });
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
          model.notice = `Could not cancel Live apply: ${errorMessage(error)}`;
        });
      }
    }
  }

  public dispose(): void {
    this.scheduler.dispose();
    this.session?.close();
    this.session = undefined;
    this.model.update((model) => {
      model.previewStatus = undefined;
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
