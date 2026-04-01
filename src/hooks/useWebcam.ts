import { cropCanvas } from "@/utils/cropCanvas";
import { mirrorCanvas } from "@/utils/mirrorCanvas";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

const useWebcam = (
  targetWidth?: number,
  targetHeight?: number
) => {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>("environment");
  const [isCameraReady, setIsCameraReady] = useState(false);

  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setIsCameraReady(false)
  }, []);

  const onCapture = useCallback((): HTMLCanvasElement | null => {
    if (!webcamRef.current) {
      return null
    }
    let captureCanvas = webcamRef.current.getCanvas();
    
    // ミラーリング処理（フロントカメラの場合）
    if (facingMode === "user") {
      captureCanvas = mirrorCanvas(captureCanvas);
    }
    
    // クロップ処理（ターゲットディメンションが指定されている場合）
    if (targetWidth && targetHeight && captureCanvas) {
      captureCanvas = cropCanvas(captureCanvas, targetWidth, targetHeight);
    }
    
    return captureCanvas;
  }, [facingMode, targetWidth, targetHeight]);

  const onUserMedia = useCallback(() => {
    setIsCameraReady(true);
  }, []);

  return { webcamRef, facingMode, isCameraReady, onCapture, onUserMedia, toggleFacingMode };
};

export default useWebcam;
