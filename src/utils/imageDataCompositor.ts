/**
 * 背景画像と前景画像を合成する
 * 両者は同じサイズであることを前提とする（クロップ済み）
 * 前景画像を背景画像の上に重ねる
 * 
 * @param background - 背景のImageData（カメラキャプチャ）
 * @param foreground - 前景のImageData（フレーム画像）
 * @returns 合成されたImageData
 */
export const compositeImageData = (background: ImageData, foreground: ImageData): ImageData | null => {
  const canvas = document.createElement("canvas");
  canvas.width = background.width;
  canvas.height = background.height;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    return null;
  }

  // 背景を描画
  ctx.putImageData(background, 0, 0);
  
  // 前景を一時Canvasに描画
  const overlayCanvas = document.createElement("canvas");
  overlayCanvas.width = foreground.width;
  overlayCanvas.height = foreground.height;
  const overlayCtx = overlayCanvas.getContext("2d");
  
  if (!overlayCtx) {
    return null;
  }
  
  overlayCtx.putImageData(foreground, 0, 0);
  
  // 前景を背景に重ねる
  // 両者のサイズが異なる場合は、前景を背景サイズにフィットさせる（cover計算）
  if (foreground.width === background.width && foreground.height === background.height) {
    // サイズが同じ場合はそのまま重ねる
    ctx.drawImage(overlayCanvas, 0, 0);
  } else {
    // サイズが異なる場合はcover計算でフィット
    const foregroundAspectRatio = foreground.width / foreground.height;
    const backgroundAspectRatio = background.width / background.height;
    
    let drawWidth: number;
    let drawHeight: number;
    let drawX: number;
    let drawY: number;
    
    if (backgroundAspectRatio > foregroundAspectRatio) {
      // 背景の方が横長
      drawWidth = background.width;
      drawHeight = background.width / foregroundAspectRatio;
      drawX = 0;
      drawY = (background.height - drawHeight) / 2;
    } else {
      // 背景の方が縦長
      drawHeight = background.height;
      drawWidth = background.height * foregroundAspectRatio;
      drawX = (background.width - drawWidth) / 2;
      drawY = 0;
    }
    
    ctx.drawImage(overlayCanvas, drawX, drawY, drawWidth, drawHeight);
  }
  
  const combinedImageData = ctx.getImageData(0, 0, background.width, background.height);
  return combinedImageData;
};
