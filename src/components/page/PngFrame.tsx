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
import { cropCanvas } from "@/utils/cropCanvas";

const PngFrame = ({ fileUrl, width, height, aspectRatio }: FrameProps) => {
  const { setCapturedCanvas, setOverlayCanvas } = useArPhotoFrameContext();
  const { webcamRef, facingMode, isCameraReady, onCapture, onUserMedia, toggleFacingMode } =
    useWebcam(aspectRatio);
  const { file } = useFetchFile(fileUrl);
  const { imageData } = usePngDecoder(file);
  const { canvasRef, onMount } = useImageDataDrawer(imageData, webcamRef);
  const { isShutterActive, triggerShutter } = useShutterEffect();
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/savePNG");
  }, [router]);

  const onClick = useCallback(() => {
    triggerShutter();
    setCapturedCanvas(onCapture());
    // オーバーレイCanvasもカメラと同じアスペクト比でクロップ
    const croppedOverlay = cropCanvas(canvasRef.current, aspectRatio);
    setOverlayCanvas(croppedOverlay);
    router.push("/savePNG");
  }, [canvasRef, onCapture, router, setCapturedCanvas, setOverlayCanvas, triggerShutter, aspectRatio]);

  return (
    <div className={style["body"]}>
      <ProgressIndicator isLoading={!file} className={style["progress-indicator"]}>
        PNGファイルを取得中...
      </ProgressIndicator>
      <ProgressIndicator isLoading={file && !imageData} className={style["progress-indicator"]}>
        PNGをデコード中...
      </ProgressIndicator>
      <ProgressIndicator
        isLoading={file && imageData && !isCameraReady}
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
            isCameraReady={isCameraReady}
            onUserMedia={onUserMedia}
            className={style["camera"]}
          />
          {isCameraReady && (
            <Canvas canvasRef={canvasRef} onMount={onMount} className={style["overlay-canvas"]} />
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

export default PngFrame;
