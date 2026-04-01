/**
 * Canvas を指定されたアスペクト比に中央クロップする
 * object-fit: cover と同じ動作を再現
 * 
 * @param sourceCanvas - 元の Canvas
 * @param targetWidth - ターゲットの幅
 * @param targetHeight - ターゲットの高さ
 * @returns クロップされた新しい Canvas
 */
export const cropCanvas = (
  sourceCanvas: HTMLCanvasElement | null,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement | null => {
  if (!sourceCanvas) return null;

  const sourceWidth = sourceCanvas.width;
  const sourceHeight = sourceCanvas.height;
  const targetAspectRatio = targetWidth / targetHeight;
  const sourceAspectRatio = sourceWidth / sourceHeight;

  // クロップ領域を計算
  let cropWidth: number;
  let cropHeight: number;
  let offsetX: number;
  let offsetY: number;

  if (sourceAspectRatio > targetAspectRatio) {
    // ソースの方が横長 → 左右をクロップ
    cropHeight = sourceHeight;
    cropWidth = sourceHeight * targetAspectRatio;
    offsetX = (sourceWidth - cropWidth) / 2;
    offsetY = 0;
  } else {
    // ソースの方が縦長 → 上下をクロップ
    cropWidth = sourceWidth;
    cropHeight = sourceWidth / targetAspectRatio;
    offsetX = 0;
    offsetY = (sourceHeight - cropHeight) / 2;
  }

  // 新しい Canvas を作成してクロップ領域を描画
  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = targetWidth;
  croppedCanvas.height = targetHeight;

  const ctx = croppedCanvas.getContext("2d");
  if (!ctx) return null;

  // クロップした領域を新しい Canvas に描画
  ctx.drawImage(
    sourceCanvas,
    offsetX,
    offsetY,
    cropWidth,
    cropHeight,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return croppedCanvas;
};
