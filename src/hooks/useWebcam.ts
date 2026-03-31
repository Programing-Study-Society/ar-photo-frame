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

  const onCapture = useCallback((): HTMLCanvasElement | null => {
    if (!webcamRef.current) {
      return null;
    }
    const captureCanvas = webcamRef.current.getCanvas();
    if (facingMode === "user") return mirrorCanvas(captureCanvas);
    return captureCanvas;
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
