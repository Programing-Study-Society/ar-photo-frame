import { useCallback, useEffect, useRef } from "react";
import Webcam from "react-webcam";

/**
 * ImageDataをCanvasに描画するフック
 * 
 * フレーム画像（ImageData）をCanvasに描画する
 * 
 * @param imageData - 描画するImageData
 */
const useImageDataDrawer = (imageData: ImageData | null, webcamRef: React.RefObject<Webcam | null>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const drawToCanvas = useCallback(() => {
    if (!imageData || !canvasRef.current || !webcamRef.current) {
      return false;
    }

    const video = webcamRef.current.video;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      return false;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    // カメラと同じ解像度でオーバーレイを持つ（保存時に同じクロップを適用するため）
    const canvasWidth = video.videoWidth;
    const canvasHeight = video.videoHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // PNGを一時Canvasへ
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return false;
    tempCtx.putImageData(imageData, 0, 0);

    // カメラは preview で object-fit: cover されるため、
    // 実際に画面に見えているビデオ領域を基準にオーバーレイを配置する。
    const frameAspectRatio = imageData.width / imageData.height;
    const videoAspectRatio = canvasWidth / canvasHeight;

    const container = video.parentElement as HTMLElement | null;
    const previewWidth = container?.clientWidth || video.clientWidth || 0;
    const previewHeight = container?.clientHeight || video.clientHeight || 0;

    // レイアウト未完了（clientWidth/Height が 0）の場合はリトライ
    if (previewWidth === 0 || previewHeight === 0) {
      return false;
    }

    const previewAspectRatio = previewWidth / previewHeight;

    // video全体のうち、cover表示で実際に見える矩形（video座標系）
    let visibleX = 0;
    let visibleY = 0;
    let visibleWidth = canvasWidth;
    let visibleHeight = canvasHeight;

    if (videoAspectRatio > previewAspectRatio) {
      visibleHeight = canvasHeight;
      visibleWidth = canvasHeight * previewAspectRatio;
      visibleX = (canvasWidth - visibleWidth) / 2;
    } else if (videoAspectRatio < previewAspectRatio) {
      visibleWidth = canvasWidth;
      visibleHeight = canvasWidth / previewAspectRatio;
      visibleY = (canvasHeight - visibleHeight) / 2;
    }

    let drawWidth: number;
    let drawHeight: number;
    let drawX: number;
    let drawY: number;

    // ガイドラインと一致するよう、見えている矩形内でcontain配置
    if (previewAspectRatio > frameAspectRatio) {
      drawHeight = visibleHeight;
      drawWidth = visibleHeight * frameAspectRatio;
      drawX = visibleX + (visibleWidth - drawWidth) / 2;
      drawY = visibleY;
    } else {
      drawWidth = visibleWidth;
      drawHeight = visibleWidth / frameAspectRatio;
      drawX = visibleX;
      drawY = visibleY + (visibleHeight - drawHeight) / 2;
    }

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

    return true;
  }, [imageData, webcamRef]);

  const onMount = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    const tryDraw = () => {
      const success = drawToCanvas();
      if (!success) {
        retryTimeoutRef.current = setTimeout(tryDraw, 100);
      }
    };

    tryDraw();
  }, [drawToCanvas]);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return { canvasRef, onMount };
};

export default useImageDataDrawer;
