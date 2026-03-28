import { mirrorCanvas } from "@/utils/mirrorCanvas";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

const useWebcam = () => {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>("environment");
  const [isCameraReady, setIsCameraReady] = useState(false);

  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setIsCameraReady(false);
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
    setIsCameraReady(true);
  }, []);

  return { webcamRef, facingMode, isCameraReady, onCapture, onUserMedia, toggleFacingMode };
};

export default useWebcam;
