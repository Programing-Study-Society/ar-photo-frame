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
  // プレビューと保存の一致を優先し、座標変換は行わない。
  // サイズ不一致時は左上原点にそのまま重ねる。
  if (foreground.width === background.width && foreground.height === background.height) {
    ctx.drawImage(overlayCanvas, 0, 0);
  } else {
    ctx.drawImage(overlayCanvas, 0, 0);
  }
  
  const combinedImageData = ctx.getImageData(0, 0, background.width, background.height);
  return combinedImageData;
};
