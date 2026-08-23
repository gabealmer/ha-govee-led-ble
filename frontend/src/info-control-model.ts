export interface RectLike {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
}

export interface ViewportBounds {
  height: number;
  left: number;
  top: number;
  width: number;
}

export interface PopoverPosition {
  left: number;
  top: number;
}

export function rectIntersectsViewport(
  rect: RectLike,
  viewport: ViewportBounds,
): boolean {
  return (
    rect.bottom > viewport.top &&
    rect.top < viewport.top + viewport.height &&
    rect.right > viewport.left &&
    rect.left < viewport.left + viewport.width
  );
}

export function popoverPosition(
  trigger: RectLike,
  popover: Pick<RectLike, "height" | "width">,
  viewport: ViewportBounds,
  gap: number,
  gutter: number,
): PopoverPosition {
  const viewportRight = viewport.left + viewport.width;
  const viewportBottom = viewport.top + viewport.height;
  const maximumLeft = Math.max(
    viewport.left + gutter,
    viewportRight - popover.width - gutter,
  );
  const left = Math.min(
    maximumLeft,
    Math.max(
      viewport.left + gutter,
      trigger.left + (trigger.width - popover.width) / 2,
    ),
  );
  const below = trigger.bottom + gap;
  const above = trigger.top - gap - popover.height;
  const top =
    below + popover.height <= viewportBottom - gutter ||
    below - viewport.top <= trigger.top - viewport.top
      ? below
      : above;

  return {
    left: Math.round(left),
    top: Math.round(
      Math.min(
        Math.max(viewport.top + gutter, top),
        Math.max(
          viewport.top + gutter,
          viewportBottom - popover.height - gutter,
        ),
      ),
    ),
  };
}
