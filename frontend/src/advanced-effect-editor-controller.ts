import { blankBrightnessPattern, blankLayer, cloneLayer } from "./advanced-effect-model";
import type { AdvancedContent, BrightnessPattern, EffectLayer, RGB } from "./types";
import { clampInteger, clonePalette, relocatedIndex } from "./ui-utils";

export const AUTHORING_LAYER_LIMIT = 5;
export const AUTHORING_PALETTE_LIMIT = 8;
export const DEFAULT_SEGMENT_COUNT = 15;
export type MovementKey = "selected_movement" | "overall_movement";

type NestedLayerKey = "area" | "distribution" | "selection" | MovementKey;

export class AdvancedEffectEditorController {
  public activeLayerIndex = 0;
  public activePatternIndex = 0;

  private content?: AdvancedContent;
  private disabled = false;

  public sync(content: AdvancedContent | undefined, disabled: boolean): void {
    this.content = content;
    this.disabled = disabled;
    if (!content?.layers.length) {
      this.activateLayer(0);
      return;
    }
    this.activeLayerIndex = clampInteger(this.activeLayerIndex, 0, content.layers.length - 1);
    const patternCount = this.activeLayer.brightness_patterns.length;
    this.activePatternIndex = patternCount ? clampInteger(this.activePatternIndex, 0, patternCount - 1) : 0;
  }

  public get activeLayer(): EffectLayer {
    return this.content!.layers[this.activeLayerIndex];
  }

  public isCurrentContent(content: AdvancedContent): boolean {
    return this.content === content;
  }

  public updateLayer(update: Partial<EffectLayer>): AdvancedContent | undefined {
    return this.canEditLayer() ? this.replaceActive({ ...this.activeLayer, ...update }) : undefined;
  }

  public replaceActiveLayer(replacement: EffectLayer): AdvancedContent | undefined {
    return this.canEditLayer() ? this.replaceActive(replacement) : undefined;
  }

  public updateBrightnessPattern(update: Partial<BrightnessPattern>): AdvancedContent | undefined {
    if (!this.canEditLayer()) {
      return undefined;
    }
    const brightnessPatterns = this.activeLayer.brightness_patterns.map((pattern, index) =>
      index === this.activePatternIndex ? { ...pattern, ...update } : { ...pattern },
    );
    return this.updateLayer({ brightness_patterns: brightnessPatterns });
  }

  public updatePalette(palette: RGB[]): AdvancedContent | undefined {
    return this.updateLayer({ palette: clonePalette(palette) });
  }

  public updateNested<K extends NestedLayerKey>(key: K, update: Partial<EffectLayer[K]>): AdvancedContent | undefined {
    if (!this.canEditLayer()) {
      return undefined;
    }
    return this.updateLayer({ [key]: { ...this.activeLayer[key], ...update } } as Partial<EffectLayer>);
  }

  public addLayer(): AdvancedContent | undefined {
    if (!this.content || this.disabled || this.content.layers.length >= AUTHORING_LAYER_LIMIT) {
      return undefined;
    }
    const layers = [...this.content.layers.map(cloneLayer), blankLayer()];
    this.activateLayer(layers.length - 1);
    return this.contentChange(layers, true);
  }

  public copyLayer(): AdvancedContent | undefined {
    if (!this.canEditLayer() || this.content!.layers.length >= AUTHORING_LAYER_LIMIT) {
      return undefined;
    }
    const layers = this.content!.layers.map(cloneLayer);
    const copyIndex = this.activeLayerIndex + 1;
    layers.splice(copyIndex, 0, cloneLayer(this.activeLayer));
    this.activateLayer(copyIndex);
    return this.contentChange(layers, true);
  }

  public deleteLayer(): AdvancedContent | undefined {
    if (!this.canEditLayer() || this.content!.layers.length === 1) {
      return undefined;
    }
    const layers = this.content!.layers.filter((_layer, index) => index !== this.activeLayerIndex).map(cloneLayer);
    this.activateLayer(Math.min(this.activeLayerIndex, layers.length - 1));
    return this.contentChange(layers);
  }

  public reorderLayer(from: number, to: number): AdvancedContent | undefined {
    if (!this.canEditLayer() || from < 0 || from >= this.content!.layers.length || to < 0 || to >= this.content!.layers.length || from === to) {
      return undefined;
    }
    const layers = this.content!.layers.map(cloneLayer);
    const [moving] = layers.splice(from, 1);
    layers.splice(to, 0, moving);
    this.activeLayerIndex = relocatedIndex(this.activeLayerIndex, from, to);
    return this.contentChange(layers);
  }

  public addBrightnessPattern(): AdvancedContent | undefined {
    if (!this.canEditLayer() || this.activeLayer.brightness_patterns.length >= 3) {
      return undefined;
    }
    const patterns = [...this.activeLayer.brightness_patterns.map((pattern) => ({ ...pattern })), blankBrightnessPattern()];
    this.activePatternIndex = patterns.length - 1;
    return this.updateLayer({ brightness_patterns: patterns });
  }

  public deleteBrightnessPattern(): AdvancedContent | undefined {
    if (!this.canEditLayer() || this.activeLayer.brightness_patterns.length === 1) {
      return undefined;
    }
    const patterns = this.activeLayer.brightness_patterns.filter((_pattern, index) => index !== this.activePatternIndex).map((pattern) => ({ ...pattern }));
    this.activePatternIndex = Math.min(this.activePatternIndex, patterns.length - 1);
    return this.updateLayer({ brightness_patterns: patterns });
  }

  public selectLayer(index: number): boolean {
    if (index === this.activeLayerIndex) {
      return false;
    }
    this.activateLayer(index);
    return true;
  }

  public selectPattern(index: number): boolean {
    if (index === this.activePatternIndex) {
      return false;
    }
    this.activePatternIndex = index;
    return true;
  }

  public visiblePatternIndex(patternCount: number): number {
    return clampInteger(this.activePatternIndex, 0, Math.max(0, patternCount - 1));
  }

  private canEditLayer(): boolean {
    return Boolean(this.content?.layers.length && !this.disabled);
  }

  private activateLayer(index: number): void {
    this.activeLayerIndex = index;
    this.activePatternIndex = 0;
  }

  private replaceActive(replacement: EffectLayer): AdvancedContent {
    return this.contentChange(
      this.content!.layers.map((layer, index) => index === this.activeLayerIndex ? cloneLayer(replacement) : cloneLayer(layer)),
    );
  }

  private contentChange(layers: EffectLayer[], install = false): AdvancedContent {
    const content: AdvancedContent = { kind: "advanced", layers };
    if (install) {
      this.content = content;
    }
    return content;
  }
}
