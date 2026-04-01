export const cloneCanvas = (source: HTMLCanvasElement | null): HTMLCanvasElement | null => {
  if (!source) return null;
  if (source.width === 0 || source.height === 0) return null;

  const cloned = document.createElement("canvas");
  cloned.width = source.width;
  cloned.height = source.height;

  const ctx = cloned.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(source, 0, 0, source.width, source.height);
  return cloned;
};
