import { EffectStudioApi } from "./api";
import {
  AsyncRequestController,
  type AsyncRequestToken,
} from "./async-request-controller";
import { PanelModel } from "./panel-model";
import { PanelPreviewController } from "./panel-preview-controller";
import type { HomeAssistant, LibrarySnapshot } from "./types";
import { errorMessage } from "./ui-utils";
import { isCompatibleEditorInfo } from "./validation";

type PanelLoadContext = { api: EffectStudioApi };
type PanelLoadRequest = AsyncRequestToken<PanelLoadContext>;

interface PanelDataOptions {
  connected(): boolean;
  initialiseSelectedDevice(): Promise<string | undefined>;
  openInitialContext(): Promise<void>;
  libraryChanged(snapshot: LibrarySnapshot): Promise<void>;
}

export class PanelDataController {
  public api?: EffectStudioApi;

  private unsubscribeLibrary?: () => void;
  private readonly loadRequests = new AsyncRequestController<PanelLoadContext>(
    (left, right) => left.api === right.api,
  );

  public constructor(
    private readonly model: PanelModel,
    private readonly preview: PanelPreviewController,
    private readonly options: PanelDataOptions,
  ) {}

  public async load(hass: HomeAssistant, isAdmin: boolean): Promise<void> {
    this.model.update((model) => {
      model.loading = true;
      model.error = undefined;
      model.previewStatus = undefined;
      model.isAdmin = isAdmin;
    });
    const api = new EffectStudioApi(hass);
    this.api = api;
    const loadRequest = this.loadRequests.begin({ api });
    let preferenceNotice: string | undefined;
    try {
      const [info, devices, library, customCatalogue, userState] =
        await Promise.all([
          api.info(),
          api.devices(),
          api.library(),
          api.customCatalogue(),
          api.userState(),
        ]);
      if (!this.loadIsCurrent(loadRequest)) {
        return;
      }
      if (!isCompatibleEditorInfo(info)) {
        throw new Error(
          "This editor bundle is not compatible with the installed backend.",
        );
      }
      this.model.update((model) => {
        model.devices = devices;
        model.library = library;
        model.customCatalogue = customCatalogue;
        model.userState = userState;
      });
      preferenceNotice = await this.options.initialiseSelectedDevice();
      if (!this.model.customEffectsAvailable) {
        this.model.update((model) => {
          model.section = "scenes";
        });
      }

      const unsubscribeLibrary = await api.subscribeLibrary(
        (snapshot) => {
          void this.options.libraryChanged(snapshot);
        },
        (error) => this.subscriptionFailed(error, loadRequest),
      );
      if (!this.loadIsCurrent(loadRequest) || this.model.error) {
        unsubscribeLibrary();
        return;
      }
      this.unsubscribeLibrary = unsubscribeLibrary;
      if (isAdmin) {
        const opened = await this.preview.open(
          api,
          (error) => this.subscriptionFailed(error, loadRequest),
        );
        if (
          !opened ||
          !this.loadIsCurrent(loadRequest) ||
          this.model.error
        ) {
          this.preview.dispose();
          return;
        }
      }

      await this.options.openInitialContext();
      if (preferenceNotice) {
        this.model.update((model) => {
          model.notice = preferenceNotice;
        });
      }
    } catch (error) {
      if (this.loadIsCurrent(loadRequest)) {
        this.stopSubscriptions();
        this.model.update((model) => {
          model.error = errorMessage(error);
        });
      }
    } finally {
      if (this.loadIsCurrent(loadRequest)) {
        this.model.update((model) => {
          model.loading = false;
        });
      }
    }
  }

  public disconnect(): void {
    this.loadRequests.invalidate();
    this.stopSubscriptions();
    this.api = undefined;
  }

  private loadIsCurrent(request: PanelLoadRequest): boolean {
    return (
      this.options.connected() &&
      this.api !== undefined &&
      this.loadRequests.isCurrent(request, { api: this.api })
    );
  }

  private subscriptionFailed(
    error: Error,
    request: PanelLoadRequest,
  ): void {
    if (!this.loadIsCurrent(request)) {
      return;
    }
    this.model.update((model) => {
      model.error = error.message;
      model.loading = false;
    });
    queueMicrotask(() => {
      if (this.loadIsCurrent(request)) {
        this.stopSubscriptions();
      }
    });
  }

  private stopSubscriptions(): void {
    this.unsubscribeLibrary?.();
    this.unsubscribeLibrary = undefined;
    this.preview.dispose();
  }
}
