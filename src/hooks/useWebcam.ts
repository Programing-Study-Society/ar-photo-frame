import { mirrorCanvas } from "@/utils/mirrorCanvas";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

const useWebcam = () => {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>("environment");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setIsCameraReady(false);
    setCameraError(null);
  }, []);

  const onCapture = useCallback((options: CaptureOptions): HTMLCanvasElement | null => {
    if (!webcamRef.current) {
      return null;
    }
    const sourceCanvas = webcamRef.current.getCanvas();
    if (!sourceCanvas) {
      return null;
    }

    const normalizedCanvas = document.createElement("canvas");
    normalizedCanvas.width = options.width;
    normalizedCanvas.height = options.height;
    const context = normalizedCanvas.getContext("2d");
    if (!context) {
      return null;
    }

    context.drawImage(sourceCanvas, 0, 0, options.width, options.height);
    if (facingMode === "user") {
      return mirrorCanvas(normalizedCanvas);
    }
    return normalizedCanvas;
  }, [facingMode]);

  const onUserMedia = useCallback(() => {
    setCameraError(null);
    setIsCameraReady(true);
  }, []);

  const onUserMediaError = useCallback((error: string | DOMException) => {
    setIsCameraReady(false);
    if (typeof error === "string") {
      setCameraError(error);
      return;
    }
    setCameraError(error.message || "カメラの起動に失敗しました。");
  }, []);

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
