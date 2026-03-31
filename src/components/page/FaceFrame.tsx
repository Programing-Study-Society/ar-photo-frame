import { useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import Camera from "@/components/ui/Camera";
import Canvas from "@/components/ui/Canvas";
import CaptureButton from "@/components/ui/CaptureButton";
import ProgressIndicator from "@/components/ui/ProgressIndicator";
import ShutterFadeIn from "@/components/ui/ShutterFadeIn";
import CameraToggleFacingButton from "@/components/ui/CameraToggleFacingButton";
import useArPhotoFrameContext from "@/hooks/useArPhotoFrameContext";
import useWebcam from "@/hooks/useWebcam";
import { useShutterEffect } from "@/hooks/useShutterEffect";
import style from "@/styles/page.module.css";
import { useFaceDetection } from "@/hooks/useFaceDetection";

const PngFrame = ({ fileUrl, width, height, aspectRatio }: FrameProps) => {
  const { setCapturedCanvas, setOverlayCanvas } = useArPhotoFrameContext();
  const {
    webcamRef,
    facingMode,
    isCameraReady,
    cameraError,
    onCapture,
    onUserMedia,
    onUserMediaError,
    toggleFacingMode,
  } = useWebcam();
  const { canvasRef, modelsLoaded, modelError, detectFaces } = useFaceDetection(webcamRef, fileUrl);
  const { isShutterActive, triggerShutter } = useShutterEffect();
  const router = useRouter();
  const frameError = modelError || cameraError;

  useEffect(() => {
    router.prefetch("/savePNG");
  }, [router]);

  const newOnUserMedia = useCallback(() => {
    onUserMedia();
    detectFaces(facingMode === "user");
  }, [onUserMedia, detectFaces, facingMode]);

  const onClick = useCallback(() => {
    triggerShutter();
    setCapturedCanvas(onCapture());
    setOverlayCanvas(canvasRef.current);
    router.push("/savePNG");
  }, [canvasRef, onCapture, router, setCapturedCanvas, setOverlayCanvas, triggerShutter]);

  return (
    <div className={style["body"]}>
      <ProgressIndicator
        isLoading={!frameError && !modelsLoaded}
        className={style["progress-indicator"]}
        testId="loading-model-indicator">
        モデルをロード中...
      </ProgressIndicator>
      <ProgressIndicator
        isLoading={!frameError && modelsLoaded && !isCameraReady}
        className={style["progress-indicator"]}
        testId="loading-camera-indicator">
        カメラを検索中...
      </ProgressIndicator>
      {frameError && (
        <div className={style["progress-indicator"]} data-testid="frame-error-message">
          {frameError}
        </div>
      )}
      <div className={style["container"]}>
        <div className={style["camera-container"]}>
          {modelsLoaded && (
            <Camera
              webcamRef={webcamRef}
              width={width}
              height={height}
              aspectRatio={aspectRatio}
              facingMode={facingMode}
              isCameraReady={isCameraReady}
              onUserMedia={newOnUserMedia}
              onUserMediaError={onUserMediaError}
              testId="camera-view"
            />
          )}
          {isCameraReady && (
            <Canvas
              canvasRef={canvasRef}
              className={style["overlay-canvas"]}
              testId="overlay-canvas"
            />
          )}
        </div>
        {isCameraReady && (
          <>
            <CaptureButton
              onClick={onClick}
              className={style["capture-button"]}
              testId="capture-button"
            />
            <CameraToggleFacingButton
              onClick={toggleFacingMode}
              className={style["camera-toggle-facing-button"]}
              testId="camera-toggle-button"
            />
          </>
        )}
      </div>
      <ShutterFadeIn isActive={isShutterActive} />
    </div>
  );
};

export default PngFrame;
