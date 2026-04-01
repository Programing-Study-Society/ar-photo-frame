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
  const { webcamRef, facingMode, isCameraReady, onCapture, onUserMedia, toggleFacingMode } =
    useWebcam(width, height);
  const { file } = useFetchFile(fileUrl);
  const { gif } = useGifDecoder(file);
  const { canvasRef, onMount, animateStop } = useGifAnimator(gif);
  const { isShutterActive, triggerShutter } = useShutterEffect();
  const router = useRouter();

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
      <ProgressIndicator isLoading={!file} className={style["progress-indicator"]}>
        GIFファイルを取得中...
      </ProgressIndicator>
      <ProgressIndicator isLoading={file && !gif} className={style["progress-indicator"]}>
        GIFをデコード中...
      </ProgressIndicator>
      <ProgressIndicator
        isLoading={file && gif && !isCameraReady}
        className={style["progress-indicator"]}>
        カメラを検索中...
      </ProgressIndicator>
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
            className={style["camera"]}
          />
          {file && gif && isCameraReady && (
            <Canvas canvasRef={canvasRef} onMount={onMount} className={style["overlay-canvas"]} />
          )}
        </div>
        {file && gif && isCameraReady && (
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

export default GifFrame;
