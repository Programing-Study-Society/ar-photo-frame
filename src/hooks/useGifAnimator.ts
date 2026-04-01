import { useCallback, useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

/**
 * GIFをCanvasにアニメーション表示するフック
 * 
 * webcamRef が指定されている場合:
 *   Canvasサイズをカメラ映像と同じサイズに設定し、
 *   GIFフレームをobject-fit: coverと同じ計算でCanvasに描画する
 * 
 * webcamRef が指定されていない場合:
 *   CanvasサイズをGIFのサイズに設定し、そのまま描画する
 * 
 * @param gif - 描画するGIFデータ
 * @param webcamRef - カメラ映像のref（サイズ取得用、オプション）
 */
const useGifAnimator = (
  gif: Gif | null,
  webcamRef?: React.RefObject<Webcam | null>
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animateStop, setAnimateStop] = useState<() => void>(() => {});
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startAnimation = useCallback((): boolean => {
    if (!gif || !canvasRef.current) {
      return false;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    let canvasWidth: number;
    let canvasHeight: number;
    let drawX: number;
    let drawY: number;
    let drawWidth: number;
    let drawHeight: number;

    // webcamRef が指定されている場合はカメラサイズに合わせる
    if (webcamRef?.current) {
      const video = webcamRef.current.video;
      if (!video) return false;

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // ビデオサイズがまだ確定していない場合はリトライ
      if (videoWidth === 0 || videoHeight === 0) {
        return false;
      }

      canvasWidth = videoWidth;
      canvasHeight = videoHeight;

      // GIF画像をobject-fit: coverと同じ計算で描画
      const gifAspectRatio = gif.width / gif.height;
      const videoAspectRatio = videoWidth / videoHeight;

      if (videoAspectRatio > gifAspectRatio) {
        drawWidth = videoWidth;
        drawHeight = videoWidth / gifAspectRatio;
        drawX = 0;
        drawY = (videoHeight - drawHeight) / 2;
      } else {
        drawHeight = videoHeight;
        drawWidth = videoHeight * gifAspectRatio;
        drawX = (videoWidth - drawWidth) / 2;
        drawY = 0;
      }
    } else {
      // webcamRef がない場合はGIFのサイズをそのまま使用
      canvasWidth = gif.width;
      canvasHeight = gif.height;
      drawX = 0;
      drawY = 0;
      drawWidth = gif.width;
      drawHeight = gif.height;
    }

    // CanvasサイズをVideoサイズまたはGIFサイズに設定
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // GIFのフレームを一時Canvasに描画するための準備
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = gif.width;
    tempCanvas.height = gif.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return false;

    let currentFrame = 0;
    let isAnimating = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const drawFrame = (frameIndex: number) => {
      if (!isAnimating) return;

      const frame = gif.frames[frameIndex];
      const delay = frame.delay;

      // GIFフレームを一時Canvasに描画
      tempCtx.putImageData(frame.imageData, 0, 0);

      // メインCanvasをクリアして、GIFフレームを描画
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(
        tempCanvas,
        0,
        0,
        gif.width,
        gif.height,
        drawX,
        drawY,
        drawWidth,
        drawHeight
      );

      timeoutId = setTimeout(() => {
        currentFrame = (currentFrame + 1) % gif.totalFrames;
        drawFrame(currentFrame);
      }, delay);
    };

    const start = () => {
      if (!isAnimating) {
        isAnimating = true;
        drawFrame(currentFrame);
      }
    };

    const stop = () => {
      isAnimating = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    start();
    setAnimateStop(() => stop);
    return true;
  }, [gif, webcamRef]);

  const onMount = useCallback(() => {
    // 既存のリトライをキャンセル
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    const tryStart = () => {
      const success = startAnimation();
      if (!success && webcamRef) {
        // webcamRef がある場合のみリトライ（ビデオサイズ待ち）
        retryTimeoutRef.current = setTimeout(tryStart, 100);
      }
    };

    tryStart();
  }, [startAnimation, webcamRef]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return { canvasRef, onMount, animateStop };
};

export default useGifAnimator;
