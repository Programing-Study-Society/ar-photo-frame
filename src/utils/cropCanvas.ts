/**
 * object-fit: cover と同じクロップ領域を計算する
 * 
 * @param sourceWidth - ソースの幅
 * @param sourceHeight - ソースの高さ
 * @param targetAspectRatio - ターゲットのアスペクト比
 * @returns クロップ領域のオフセットとサイズ
 */
export const calculateCropRegion = (
  sourceWidth: number,
  sourceHeight: number,
  targetAspectRatio: number
): { offsetX: number; offsetY: number; cropWidth: number; cropHeight: number } => {
  const sourceAspectRatio = sourceWidth / sourceHeight;

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

  return { offsetX, offsetY, cropWidth, cropHeight };
};

/**
 * Canvas を指定されたアスペクト比に中央クロップする
 * object-fit: cover と同じ動作を再現
 * 出力サイズはクロップ領域のネイティブサイズを維持（リサイズしない）
 * 
 * @param sourceCanvas - 元の Canvas
 * @param targetAspectRatio - ターゲットのアスペクト比
 * @returns クロップされた新しい Canvas（ネイティブ解像度）
 */
export const cropCanvas = (
  sourceCanvas: HTMLCanvasElement | null,
  targetAspectRatio: number
): HTMLCanvasElement | null => {
  if (!sourceCanvas) return null;

  const sourceWidth = sourceCanvas.width;
  const sourceHeight = sourceCanvas.height;

  const { offsetX, offsetY, cropWidth, cropHeight } = calculateCropRegion(
    sourceWidth,
    sourceHeight,
    targetAspectRatio
  );

  // 新しい Canvas を作成してクロップ領域を描画（ネイティブ解像度を維持）
  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = Math.round(cropWidth);
  croppedCanvas.height = Math.round(cropHeight);

  const ctx = croppedCanvas.getContext("2d");
  if (!ctx) return null;

  // クロップした領域を新しい Canvas に描画（リサイズなし）
  ctx.drawImage(
    sourceCanvas,
    offsetX,
    offsetY,
    cropWidth,
    cropHeight,
    0,
    0,
    croppedCanvas.width,
    croppedCanvas.height
  );

  return croppedCanvas;
};
