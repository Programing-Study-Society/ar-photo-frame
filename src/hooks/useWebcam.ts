import { cropCanvas } from "@/utils/cropCanvas";
import { mirrorCanvas } from "@/utils/mirrorCanvas";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

const useWebcam = (
  targetAspectRatio?: number
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
    
    // クロップ処理（ターゲットアスペクト比が指定されている場合）
    if (targetAspectRatio && captureCanvas) {
      captureCanvas = cropCanvas(captureCanvas, targetAspectRatio);
    }
    
    return captureCanvas;
  }, [facingMode, targetAspectRatio]);

  const onUserMedia = useCallback(() => {
    setIsCameraReady(true);
  }, []);

  return { webcamRef, facingMode, isCameraReady, onCapture, onUserMedia, toggleFacingMode };
};

export default useWebcam;
