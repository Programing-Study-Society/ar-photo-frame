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
import { cloneCanvas } from "@/utils/cloneCanvas";

const FaceFrame = ({ fileUrl, width, height, aspectRatio }: FrameProps) => {
  const { setCapturedCanvas, setOverlayCanvas } = useArPhotoFrameContext();
  const {
    webcamRef,
    videoConstraints,
    facingMode,
    isCameraReady,
    onCapture,
    onUserMedia,
    onUserMediaError,
    toggleFacingMode,
  } =
    useWebcam(aspectRatio, { enableCrop: false });
  const { canvasRef, modelsLoaded, detectFaces } = useFaceDetection(webcamRef, fileUrl);
  const { isShutterActive, triggerShutter } = useShutterEffect();
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/savePNG");
  }, [router]);

  const newOnUserMedia = useCallback(() => {
    onUserMedia();
    detectFaces(facingMode === "user");
  }, [onUserMedia, detectFaces, facingMode]);

  const onClick = useCallback(() => {
    const captured = onCapture();
    const overlay = cloneCanvas(canvasRef.current);

    if (!captured || !overlay) {
      return;
    }

    triggerShutter();
    setCapturedCanvas(captured);
    setOverlayCanvas(overlay);
    router.push("/savePNG");
  }, [
    canvasRef,
    onCapture,
    router,
    setCapturedCanvas,
    setOverlayCanvas,
    triggerShutter,
  ]);

  return (
    <div className={style["body"]}>
      <ProgressIndicator isLoading={!modelsLoaded} className={style["progress-indicator"]}>
        モデルをロード中...
      </ProgressIndicator>
      <ProgressIndicator
        isLoading={modelsLoaded && !isCameraReady}
        className={style["progress-indicator"]}>
        カメラを検索中...
      </ProgressIndicator>
      <div className={style["container"]}>
        <div className={style["camera-container"]}>
          {modelsLoaded && (
            <Camera
              webcamRef={webcamRef}
              width={width}
              height={height}
              aspectRatio={aspectRatio}
              videoConstraints={videoConstraints}
              facingMode={facingMode}
              isCameraReady={isCameraReady}
              onUserMedia={newOnUserMedia}
              onUserMediaError={onUserMediaError}
              className={style["camera"]}
            />
          )}
          {isCameraReady && (
            <Canvas canvasRef={canvasRef} className={style["overlay-canvas-face"]} />
          )}
        </div>
        {isCameraReady && (
          <>
            <CaptureButton onClick={onClick} className={style["capture-button"]} />
            <CameraToggleFacingButton
              onClick={toggleFacingMode}
              className={style["camera-toggle-facing-button"]}
            />
          </>
        )}
      </div>
      <ShutterFadeIn isActive={isShutterActive} />
    </div>
  );
};

export default FaceFrame;
