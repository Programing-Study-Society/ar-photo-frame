import { cropCanvas } from "@/utils/cropCanvas";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

const useWebcam = (
  targetAspectRatio?: number,
  options?: { enableCrop?: boolean }
) => {
  const enableCrop = options?.enableCrop ?? true;

  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>("environment");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [useExactFacingMode, setUseExactFacingMode] = useState(true);

  const getViewportAspectRatio = useCallback((): number => {
    if (typeof window === "undefined") {
      return 16 / 9;
    }

    const width = window.innerWidth || 1080;
    const height = window.innerHeight || 1920;
    return width / height;
  }, []);

  const getVideoConstraints = useCallback((): MediaTrackConstraints => {
    const viewportAspectRatio = getViewportAspectRatio();

    return {
      // Ask browser for a high-resolution source close to current viewport ratio.
      // This helps keep full-screen preview while reducing apparent over-zoom from aspect mismatch.
      width: { ideal: 4096 },
      height: { ideal: 2160 },
      aspectRatio: { ideal: viewportAspectRatio },
      facingMode: useExactFacingMode ? { exact: facingMode } : { ideal: facingMode },
      resizeMode: "none",
    };
  }, [facingMode, getViewportAspectRatio, useExactFacingMode]);

  const getPreviewAspectRatio = useCallback((): number | null => {
    const video = webcamRef.current?.video;
    if (!video) return null;

    const container = video.parentElement as HTMLElement | null;
    const width = container?.clientWidth || video.clientWidth || video.videoWidth;
    const height = container?.clientHeight || video.clientHeight || video.videoHeight;

    if (!width || !height) return null;
    return width / height;
  }, []);

  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setUseExactFacingMode(true);
    setIsCameraReady(false);
  }, []);

  const onCapture = useCallback((previewAspectRatio?: number): HTMLCanvasElement | null => {
    if (!webcamRef.current) {
      return null
    }
    let captureCanvas = webcamRef.current.getCanvas();

    if (!enableCrop) {
      return captureCanvas;
    }
    
    // クロップ処理
    // 1) まずプレビュー表示領域のアスペクト比でクロップしてWYSIWYGにする
    // 2) 取得できない場合のみtargetAspectRatioをフォールバックで使用
    const resolvedPreviewAspectRatio = previewAspectRatio ?? getPreviewAspectRatio();
    const cropAspectRatio = resolvedPreviewAspectRatio ?? targetAspectRatio;
    if (cropAspectRatio && captureCanvas) {
      captureCanvas = cropCanvas(captureCanvas, cropAspectRatio);
    }
    
    return captureCanvas;
  }, [enableCrop, getPreviewAspectRatio, targetAspectRatio]);

  const onUserMedia = useCallback(() => {
    setIsCameraReady(true);
  }, []);

  const onUserMediaError = useCallback(() => {
    setIsCameraReady(false);
    // Some browsers/devices cannot satisfy exact facingMode constraints.
    // Retry automatically with ideal constraints so camera still becomes usable.
    setUseExactFacingMode((prev) => (prev ? false : prev));
  }, []);

  return {
    webcamRef,
    videoConstraints: getVideoConstraints(),
    facingMode,
    isCameraReady,
    onCapture,
    onUserMedia,
    onUserMediaError,
    toggleFacingMode,
    getPreviewAspectRatio,
    useExactFacingMode,
  };
};

export default useWebcam;
