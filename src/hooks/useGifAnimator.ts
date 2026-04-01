import { useCallback, useRef, useState } from "react";
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

  const onMount = useCallback(() => {
    if (!gif || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let canvasWidth: number;
    let canvasHeight: number;
    let drawX: number;
    let drawY: number;
    let drawWidth: number;
    let drawHeight: number;

    // webcamRef が指定されている場合はカメラサイズに合わせる
    if (webcamRef?.current) {
      const video = webcamRef.current.video;
      if (!video) return;

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      canvasWidth = videoWidth;
      canvasHeight = videoHeight;

      // GIF画像をobject-fit: coverと同じ計算で描画
      const gifAspectRatio = gif.width / gif.height;
      const videoAspectRatio = videoWidth / videoHeight;

      if (videoAspectRatio > gifAspectRatio) {
        // カメラの方が横長 → GIFを左右に引き延ばす
        drawWidth = videoWidth;
        drawHeight = videoWidth / gifAspectRatio;
        drawX = 0;
        drawY = (videoHeight - drawHeight) / 2;
      } else {
        // カメラの方が縦長 → GIFを上下に引き延ばす
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
    if (!tempCtx) return;

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
  }, [gif, webcamRef]);

  return { canvasRef, onMount, animateStop };
};

export default useGifAnimator;
