/**
 * object-fit: cover での座標変換を計算する
 * ビデオストリームの実際のサイズと、CSS で表示される領域のズレを補正
 * 
 * @param videoWidth - ビデオストリームの実際の幅
 * @param videoHeight - ビデオストリームの実際の高さ
 * @param displayWidth - 表示領域の幅
 * @param displayHeight - 表示領域の高さ
 * @returns クロップ領域のオフセットとスケール情報
 */
export const calculateCoverTransform = (
  videoWidth: number,
  videoHeight: number,
  displayWidth: number,
  displayHeight: number
) => {
  const videoAspectRatio = videoWidth / videoHeight;
  const displayAspectRatio = displayWidth / displayHeight;

  let scale: number;
  let offsetX: number;
  let offsetY: number;

  if (videoAspectRatio > displayAspectRatio) {
    // ビデオの方が横長 → 左右がクロップされる
    scale = displayHeight / videoHeight;
    const visibleWidth = displayWidth / scale;
    offsetX = (videoWidth - visibleWidth) / 2;
    offsetY = 0;
  } else {
    // ビデオの方が縦長 → 上下がクロップされる
    scale = displayWidth / videoWidth;
    const visibleHeight = displayHeight / scale;
    offsetX = 0;
    offsetY = (videoHeight - visibleHeight) / 2;
  }

  return { scale, offsetX, offsetY };
};
