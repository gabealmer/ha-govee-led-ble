import { PanelModel, type DeleteCandidate } from "./panel-model";

interface PanelModalHost {
  updateComplete(): Promise<unknown>;
  root(): ShadowRoot | null;
  canMutate(): boolean;
}

export class PanelModalController {
  private deleteReturnFocus?: HTMLElement;
  private saveNameReturnFocus?: HTMLElement;
  private scrollLock?: { bodyOverflow: string; documentOverflow: string };
  private transitionDialogTeardown?: () => void;

  public constructor(
    private readonly model: PanelModel,
    private readonly host: PanelModalHost,
  ) {}

  public get open(): boolean {
    return (
      this.model.saveNameDialogOpen ||
      this.model.deleteCandidate !== undefined ||
      this.model.pendingTransitionDialog !== undefined
    );
  }

  public get deleteCandidate(): DeleteCandidate | undefined {
    return this.model.deleteCandidate;
  }

  public closeForEditorTransition(): void {
    if (this.model.pendingTransitionDialog) {
      this.transitionDialogTeardown?.();
    }
    this.saveNameReturnFocus = undefined;
    this.model.saveNameDialogOpen = false;
    this.model.saveNameError = undefined;
    this.model.pendingTransitionDialog = undefined;
  }

  public setTransitionDialogTeardown(callback: () => void): void {
    this.transitionDialogTeardown = callback;
  }

  public requestTransition(
    primaryLabel: "Save" | "Save As",
    saveName: string,
    requiresName: boolean,
    returnFocus?: HTMLElement,
  ): void {
    if (this.open) {
      return;
    }
    this.saveNameReturnFocus = returnFocus;
    this.model.patch({
      pendingTransitionDialog: {
        primaryLabel,
        saveName,
        requiresName,
        busy: false,
      },
    });
    void this.host.updateComplete().then(() => {
      const selector =
        primaryLabel === "Save As"
          ? ".transition-dialog input"
          : ".transition-dialog .secondary";
      this.host.root()?.querySelector<HTMLElement>(selector)?.focus();
    });
  }

  public updateTransitionName(saveName: string): void {
    const dialog = this.model.pendingTransitionDialog;
    if (dialog) {
      this.model.patch({
        pendingTransitionDialog: {
          ...dialog,
          saveName,
          error: undefined,
        },
      });
    }
  }

  public updateTransition(
    change: Partial<NonNullable<PanelModel["pendingTransitionDialog"]>>,
  ): void {
    const dialog = this.model.pendingTransitionDialog;
    if (dialog) {
      this.model.patch({
        pendingTransitionDialog: { ...dialog, ...change },
      });
    }
  }

  public closeTransition(restoreFocus: boolean): void {
    const returnFocus = this.saveNameReturnFocus;
    this.saveNameReturnFocus = undefined;
    this.model.patch({ pendingTransitionDialog: undefined });
    if (restoreFocus) {
      this.restoreFocus(returnFocus);
    }
  }

  public requestDelete(candidate: DeleteCandidate, returnFocus: HTMLElement): void {
    if (!this.host.canMutate() || !this.model.isAdmin || this.model.deletingItemId !== undefined || this.model.saving) return;
    this.deleteReturnFocus = returnFocus;
    this.model.patch({ deleteCandidate: { ...candidate }, notice: undefined });
    void this.host.updateComplete().then(() => {
      this.host.root()?.querySelector<HTMLButtonElement>(".delete-dialog .secondary")?.focus();
    });
  }

  public cancelDelete(): void {
    const returnFocus = this.deleteReturnFocus;
    this.deleteReturnFocus = undefined;
    this.model.patch({ deleteCandidate: undefined });
    this.restoreFocus(returnFocus);
  }

  public takeDeleteCandidate(): DeleteCandidate | undefined {
    const candidate = this.model.deleteCandidate;
    this.deleteReturnFocus = undefined;
    this.model.patch({ deleteCandidate: undefined });
    return candidate;
  }

  public requestSave(save: () => void): void {
    if (!this.model.isAdmin || !this.model.canSaveCurrentDraft || this.model.saving || this.model.deletingCurrentItem) return;
    save();
  }

  public requestSaveAs(
    returnFocus: HTMLElement,
    suggestedName: string,
  ): void {
    if (
      !this.host.canMutate() ||
      !this.model.isAdmin ||
      this.model.saving ||
      this.model.deletingCurrentItem
    ) {
      return;
    }
    this.requestNamedSave(returnFocus, suggestedName);
  }

  private requestNamedSave(
    returnFocus: HTMLElement,
    value: string,
  ): void {
    this.saveNameReturnFocus = returnFocus;
    this.model.patch({
      saveNameValue: value,
      saveNameError: undefined,
      saveNameDialogOpen: true,
    });
    void this.host.updateComplete().then(() => {
      const input = this.host.root()?.querySelector<HTMLInputElement>(".save-dialog input");
      input?.focus();
      input?.select();
    });
  }

  public saveNameChanged(saveNameValue: string): void {
    this.model.patch({ saveNameValue, saveNameError: undefined });
  }

  public cancelSaveName(): void {
    const returnFocus = this.saveNameReturnFocus;
    this.saveNameReturnFocus = undefined;
    this.model.patch({ saveNameDialogOpen: false, saveNameError: undefined });
    this.restoreFocus(returnFocus);
  }

  public confirmNamedSave(
    save: (name: string) => void,
  ): void {
    const name = this.model.saveNameValue.trim();
    if (!name) {
      this.model.patch({ saveNameError: "Enter an effect name." });
      void this.host.updateComplete().then(() => {
        this.host.root()?.querySelector<HTMLInputElement>(".save-dialog input")?.focus();
      });
      return;
    }
    this.saveNameReturnFocus = undefined;
    this.model.patch({
      saveNameDialogOpen: false,
      saveNameError: undefined,
    });
    save(name);
  }

  public dialogKeyDown(event: KeyboardEvent, cancel: () => void): void {
    if (event.key === "Tab") this.trapDialogFocus(event);
    else if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    }
  }

  public focusActiveSectionIfNeeded(): void {
    void this.host.updateComplete().then(() => {
      if (!this.host.root()?.activeElement) {
        this.host.root()?.querySelector<HTMLButtonElement>('.primary-nav .selector[aria-current="page"]')?.focus();
      }
    });
  }

  public syncScrollLock(): void {
    if (!this.open) {
      this.releaseScrollLock();
      return;
    }
    if (this.scrollLock) return;
    this.scrollLock = {
      bodyOverflow: document.body.style.overflow,
      documentOverflow: document.documentElement.style.overflow,
    };
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }

  public releaseScrollLock(): void {
    if (!this.scrollLock) return;
    document.body.style.overflow = this.scrollLock.bodyOverflow;
    document.documentElement.style.overflow = this.scrollLock.documentOverflow;
    this.scrollLock = undefined;
  }

  private restoreFocus(element: HTMLElement | undefined): void {
    void this.host.updateComplete().then(() => {
      if (element?.isConnected) element.focus();
    });
  }

  private trapDialogFocus(event: KeyboardEvent): void {
    const dialog = event.currentTarget as HTMLElement;
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    )).filter((element) => element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    const root = dialog.getRootNode();
    const active = root instanceof ShadowRoot ? root.activeElement : document.activeElement;
    const activeIsFocusable = active instanceof HTMLElement && focusable.includes(active);
    if (event.shiftKey && (active === first || !activeIsFocusable)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !activeIsFocusable)) {
      event.preventDefault();
      first.focus();
    }
  }
}
