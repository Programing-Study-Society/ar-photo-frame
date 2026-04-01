import { mirrorCanvas } from "@/utils/mirrorCanvas";
import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const drawCoverImage = (
  context: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
) => {
  const sourceAspectRatio = sourceWidth / sourceHeight;
  const targetAspectRatio = targetWidth / targetHeight;

  let sourceX = 0;
  let sourceY = 0;
  let sourceCropWidth = sourceWidth;
  let sourceCropHeight = sourceHeight;

  if (sourceAspectRatio > targetAspectRatio) {
    sourceCropWidth = sourceHeight * targetAspectRatio;
    sourceX = (sourceWidth - sourceCropWidth) / 2;
  } else if (sourceAspectRatio < targetAspectRatio) {
    sourceCropHeight = sourceWidth / targetAspectRatio;
    sourceY = (sourceHeight - sourceCropHeight) / 2;
  }

  context.drawImage(
    source,
    sourceX,
    sourceY,
    sourceCropWidth,
    sourceCropHeight,
    0,
    0,
    targetWidth,
    targetHeight
  );
};

const useWebcam = () => {
  const webcamRef = useRef<Webcam>(null);
  const cameraReadyAnimationFrameRef = useRef<number | null>(null);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>("environment");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const cancelCameraReadyAnimationFrame = useCallback(() => {
    if (cameraReadyAnimationFrameRef.current !== null) {
      cancelAnimationFrame(cameraReadyAnimationFrameRef.current);
      cameraReadyAnimationFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelCameraReadyAnimationFrame();
    };
  }, [cancelCameraReadyAnimationFrame]);

  const toggleFacingMode = useCallback(() => {
    cancelCameraReadyAnimationFrame();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setIsCameraReady(false);
    setCameraError(null);
  }, [cancelCameraReadyAnimationFrame]);

  const onCapture = useCallback((options: CaptureOptions): HTMLCanvasElement | null => {
    if (!webcamRef.current) {
      return null;
    }
    const normalizedCanvas = document.createElement("canvas");
    normalizedCanvas.width = options.width;
    normalizedCanvas.height = options.height;
    const context = normalizedCanvas.getContext("2d");
    if (!context) {
      return null;
    }

    const sourceVideo = webcamRef.current.video;
    if (
      sourceVideo &&
      sourceVideo.videoWidth > 0 &&
      sourceVideo.videoHeight > 0 &&
      sourceVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      drawCoverImage(
        context,
        sourceVideo,
        sourceVideo.videoWidth,
        sourceVideo.videoHeight,
        options.width,
        options.height
      );
    } else {
      const sourceCanvas = webcamRef.current.getCanvas();
      if (!sourceCanvas || sourceCanvas.width <= 0 || sourceCanvas.height <= 0) {
        return null;
      }
      drawCoverImage(
        context,
        sourceCanvas,
        sourceCanvas.width,
        sourceCanvas.height,
        options.width,
        options.height
      );
    }

    if (facingMode === "user") {
      return mirrorCanvas(normalizedCanvas);
    }
    return normalizedCanvas;
  }, [facingMode]);

  const onUserMedia = useCallback(() => {
    cancelCameraReadyAnimationFrame();
    setCameraError(null);
    setIsCameraReady(false);
    const waitUntilCameraDrawable = () => {
      const sourceVideo = webcamRef.current?.video;
      if (
        sourceVideo &&
        sourceVideo.videoWidth > 0 &&
        sourceVideo.videoHeight > 0 &&
        sourceVideo.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA
      ) {
        setIsCameraReady(true);
        cameraReadyAnimationFrameRef.current = null;
        return;
      }
      cameraReadyAnimationFrameRef.current = requestAnimationFrame(waitUntilCameraDrawable);
    };
    waitUntilCameraDrawable();
  }, [cancelCameraReadyAnimationFrame]);

  const onUserMediaError = useCallback((error: string | DOMException) => {
    cancelCameraReadyAnimationFrame();
    setIsCameraReady(false);
    if (typeof error === "string") {
      setCameraError(error);
      return;
    }
    setCameraError(error.message || "カメラの起動に失敗しました。");
  }, [cancelCameraReadyAnimationFrame]);

  return {
    webcamRef,
    facingMode,
    isCameraReady,
    cameraError,
    onCapture,
    onUserMedia,
    onUserMediaError,
    toggleFacingMode,
  };
};

export default useWebcam;
