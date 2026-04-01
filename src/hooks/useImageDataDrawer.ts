import { useCallback, useRef } from "react";
import Webcam from "react-webcam";

/**
 * ImageDataをCanvasに描画するフック
 * 
 * Canvasサイズをカメラ映像と同じサイズに設定し、
 * フレーム画像（ImageData）をobject-fit: coverと同じ計算でCanvasに描画する
 * 
 * @param imageData - 描画するImageData
 * @param webcamRef - カメラ映像のref（サイズ取得用）
 */
const useImageDataDrawer = (
  imageData: ImageData | null,
  webcamRef: React.RefObject<Webcam | null>
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onMount = useCallback(() => {
    if (!imageData || !canvasRef.current || !webcamRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // カメラ映像のサイズを取得
    const video = webcamRef.current.video;
    if (!video) return;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // CanvasサイズをVideoサイズに設定
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // フレーム画像をImageDataから一時Canvasに描画
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;
    tempCtx.putImageData(imageData, 0, 0);

    // フレーム画像をobject-fit: coverと同じ計算でCanvasに描画
    // フレーム画像のアスペクト比でカメラ映像をクロップする場合の計算の逆
    const frameAspectRatio = imageData.width / imageData.height;
    const videoAspectRatio = videoWidth / videoHeight;

    let drawWidth: number;
    let drawHeight: number;
    let drawX: number;
    let drawY: number;

    if (videoAspectRatio > frameAspectRatio) {
      // カメラの方が横長 → フレーム画像を左右に引き延ばす
      drawWidth = videoWidth;
      drawHeight = videoWidth / frameAspectRatio;
      drawX = 0;
      drawY = (videoHeight - drawHeight) / 2;
    } else {
      // カメラの方が縦長 → フレーム画像を上下に引き延ばす
      drawHeight = videoHeight;
      drawWidth = videoHeight * frameAspectRatio;
      drawX = (videoWidth - drawWidth) / 2;
      drawY = 0;
    }

    // フレーム画像をCanvas全体にcover表示で描画
    ctx.drawImage(
      tempCanvas,
      0,
      0,
      imageData.width,
      imageData.height,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    );
  }, [imageData, webcamRef]);

  return { canvasRef, onMount };
};

export default useImageDataDrawer;
