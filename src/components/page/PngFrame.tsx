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
import useFetchFile from "@/hooks/useFetchFile";
import usePngDecoder from "@/hooks/usePngDecoder";
import useImageDataDrawer from "@/hooks/useImageDataDrawer";

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
  const { file, error: fileError } = useFetchFile(fileUrl);
  const { imageData, error: decodeError } = usePngDecoder(file);
  const { canvasRef, onMount } = useImageDataDrawer(imageData);
  const { isShutterActive, triggerShutter } = useShutterEffect();
  const router = useRouter();
  const frameError = fileError || decodeError || cameraError;

  useEffect(() => {
    router.prefetch("/savePNG");
  }, [router]);

  const onClick = useCallback(() => {
    triggerShutter();
    setCapturedCanvas(
      onCapture({
        width,
        height,
      })
    );
    setOverlayCanvas(canvasRef.current);
    router.push("/savePNG");
  }, [canvasRef, onCapture, router, setCapturedCanvas, setOverlayCanvas, triggerShutter, width, height]);

  return (
    <div className={style["body"]}>
      <ProgressIndicator
        isLoading={!frameError && !file}
        className={style["progress-indicator"]}
        testId="loading-file-indicator">
        PNGファイルを取得中...
      </ProgressIndicator>
      <ProgressIndicator
        isLoading={!frameError && !!file && !imageData}
        className={style["progress-indicator"]}
        testId="loading-decode-indicator">
        PNGをデコード中...
      </ProgressIndicator>
      <ProgressIndicator
        isLoading={!frameError && !!file && !!imageData && !isCameraReady}
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
          <Camera
            webcamRef={webcamRef}
            width={width}
            height={height}
            aspectRatio={aspectRatio}
            facingMode={facingMode}
            isCameraReady={isCameraReady}
            onUserMedia={onUserMedia}
            onUserMediaError={onUserMediaError}
            testId="camera-view"
          />
          {isCameraReady && (
            <Canvas
              canvasRef={canvasRef}
              onMount={onMount}
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
