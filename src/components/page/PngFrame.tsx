import { useCallback, useEffect, useRef } from "react";
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
import { cloneCanvas } from "@/utils/cloneCanvas";
import { cropCanvas, cropCanvasByRegion } from "@/utils/cropCanvas";

const PngFrame = ({ fileUrl, width, height, aspectRatio }: FrameProps) => {
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
  const { file } = useFetchFile(fileUrl);
  const { imageData } = usePngDecoder(file);
  const { canvasRef, onMount } = useImageDataDrawer(imageData, webcamRef);
  const { isShutterActive, triggerShutter } = useShutterEffect();
  const router = useRouter();
  const cameraContainerRef = useRef<HTMLDivElement>(null);
  const captureGuideRef = useRef<HTMLDivElement>(null);
  const frameAspectRatio = imageData
    ? imageData.width / imageData.height
    : width / height;

  useEffect(() => {
    router.prefetch("/savePNG");
  }, [router]);

  const getGuideCropRegion = useCallback(
    (sourceWidth: number, sourceHeight: number) => {
      const container = cameraContainerRef.current;
      const guide = captureGuideRef.current;
      if (!container || !guide) {
        return null;
      }

      const containerRect = container.getBoundingClientRect();
      const guideRect = guide.getBoundingClientRect();

      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;
      if (containerWidth <= 0 || containerHeight <= 0) {
        return null;
      }

      const guideX = guideRect.left - containerRect.left;
      const guideY = guideRect.top - containerRect.top;
      const guideWidth = guideRect.width;
      const guideHeight = guideRect.height;

      const scale = Math.max(containerWidth / sourceWidth, containerHeight / sourceHeight);
      const displayedWidth = sourceWidth * scale;
      const displayedHeight = sourceHeight * scale;
      const offsetX = (containerWidth - displayedWidth) / 2;
      const offsetY = (containerHeight - displayedHeight) / 2;

      const sourceX = (guideX - offsetX) / scale;
      const sourceY = (guideY - offsetY) / scale;
      const sourceCropWidth = guideWidth / scale;
      const sourceCropHeight = guideHeight / scale;

      return {
        x: sourceX,
        y: sourceY,
        width: sourceCropWidth,
        height: sourceCropHeight,
      };
    },
    []
  );

  const onClick = useCallback(() => {
    const captured = onCapture();
    const overlay = cloneCanvas(canvasRef.current);

    if (!captured || !overlay) {
      return;
    }

    const cropRegion = getGuideCropRegion(captured.width, captured.height);
    const croppedCaptured = cropRegion
      ? cropCanvasByRegion(captured, cropRegion)
      : cropCanvas(captured, frameAspectRatio);
    const croppedOverlay = cropRegion
      ? cropCanvasByRegion(overlay, cropRegion)
      : cropCanvas(overlay, frameAspectRatio);

    if (!croppedCaptured || !croppedOverlay) {
      return;
    }

    triggerShutter();
    setCapturedCanvas(croppedCaptured);
    setOverlayCanvas(croppedOverlay);
    router.push("/savePNG");
  }, [
    canvasRef,
    frameAspectRatio,
    getGuideCropRegion,
    onCapture,
    router,
    setCapturedCanvas,
    setOverlayCanvas,
    triggerShutter,
  ]);

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
        <div ref={cameraContainerRef} className={style["camera-container"]}>
          <Camera
            webcamRef={webcamRef}
            width={width}
            height={height}
            aspectRatio={aspectRatio}
            videoConstraints={videoConstraints}
            facingMode={facingMode}
            isCameraReady={isCameraReady}
            onUserMedia={onUserMedia}
            onUserMediaError={onUserMediaError}
            className={style["camera"]}
          />
          {isCameraReady && (
            <Canvas
              canvasRef={canvasRef}
              onMount={onMount}
              className={style["overlay-canvas-png"]}
            />
          )}
          {isCameraReady && (
            <div
              ref={captureGuideRef}
              className={style["capture-guide"]}
              style={{
                width: `min(100vw, calc(100dvh * ${frameAspectRatio}))`,
                height: `min(100dvh, calc(100vw / ${frameAspectRatio}))`,
              }}
              aria-hidden="true"
            />
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
