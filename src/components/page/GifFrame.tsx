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
import useGifDecoder from "@/hooks/useGifDecoder";
import useGifAnimator from "@/hooks/useGifAnimator";
import { useShutterEffect } from "@/hooks/useShutterEffect";
import style from "@/styles/page.module.css";
import useFetchFile from "@/hooks/useFetchFile";

const GifFrame = ({ fileUrl, width, height, aspectRatio }: FrameProps) => {
  const { setCapturedCanvas, setOverlayGif } = useArPhotoFrameContext();
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
  const { gif, error: decodeError } = useGifDecoder(file);
  const { canvasRef, onMount, animateStop } = useGifAnimator(gif);
  const { isShutterActive, triggerShutter } = useShutterEffect();
  const router = useRouter();
  const frameError = fileError || decodeError || cameraError;

  useEffect(() => {
    router.prefetch("/saveGIF");
    router.prefetch("/savePNG");
  }, [router, gif]);

  const onClick = useCallback(() => {
    animateStop();
    triggerShutter();
    setCapturedCanvas(onCapture());
    setOverlayGif(gif);
    router.push("/saveGIF");
  }, [
    onCapture,
    router,
    setCapturedCanvas,
    triggerShutter,
    animateStop,
    setOverlayGif,
    gif,
  ]);

  return (
    <div className={style["body"]}>
      <ProgressIndicator
        isLoading={!frameError && !file}
        className={style["progress-indicator"]}
        testId="loading-file-indicator">
        GIFファイルを取得中...
      </ProgressIndicator>
      <ProgressIndicator
        isLoading={!frameError && !!file && !gif}
        className={style["progress-indicator"]}
        testId="loading-decode-indicator">
        GIFをデコード中...
      </ProgressIndicator>
      <ProgressIndicator
        isLoading={!frameError && !!file && !!gif && !isCameraReady}
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
            isCameraReady={file && gif && isCameraReady}
            onUserMedia={onUserMedia}
            onUserMediaError={onUserMediaError}
            className={style["camera"]}
            testId="camera-view"
          />
          {file && gif && isCameraReady && (
            <Canvas
              canvasRef={canvasRef}
              onMount={onMount}
              className={style["overlay-canvas"]}
              testId="overlay-canvas"
            />
          )}
        </div>
        {file && gif && isCameraReady && (
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

export default GifFrame;
