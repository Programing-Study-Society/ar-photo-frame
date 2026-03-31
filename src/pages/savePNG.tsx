import Canvas from "@/components/ui/Canvas";
import SaveButton from "@/components/ui/SaveButton";
import useImageDataCompositor from "@/hooks/useImageDataCompositor";
import usePngEncoder from "@/hooks/usePngEncoder";
import useOnSave from "@/hooks/useOnSave";
import style from "@/styles/page.module.css";
import ShutterFadeOut from "@/components/ui/ShutterFadeOut";
import ProgressIndicator from "@/components/ui/ProgressIndicator";
import useArPhotoFrameContext from "@/hooks/useArPhotoFrameContext";
import useDrawImageData from "@/hooks/useDrawImageData";

const SaveImage = () => {
  const { capturedCanvas, overlayCanvas } = useArPhotoFrameContext();
  const { combinedImageData } = useImageDataCompositor(capturedCanvas, overlayCanvas);
  const { canvasRef } = useDrawImageData(combinedImageData);
  const { blob, error } = usePngEncoder(combinedImageData);
  const { onSave } = useOnSave(blob, ".png");
  const hasInvalidState = !capturedCanvas || !overlayCanvas;

  return (
    <div className={style.body}>
      <div className={style["container"]}>
        {hasInvalidState && (
          <div className={style["mini-progress-indicator"]} data-testid="save-page-error-message">
            画像データが見つかりません。最初からやり直してください。
          </div>
        )}
        {combinedImageData && (
          <>
            <Canvas canvasRef={canvasRef} className={style["canvas"]} testId="save-preview-canvas" />
            <ProgressIndicator
              isLoading={!error && !blob}
              className={style["mini-progress-indicator"]}
              testId="encoding-progress-indicator">
              PNGにエンコード中...
            </ProgressIndicator>
            {error && (
              <div className={style["mini-progress-indicator"]} data-testid="save-page-error-message">
                {error}
              </div>
            )}
            {blob && (
              <SaveButton onClick={onSave} className={style["save-button"]} testId="save-button" />
            )}
          </>
        )}
      </div>
      {combinedImageData && <ShutterFadeOut />}
    </div>
  );
};

export default SaveImage;
