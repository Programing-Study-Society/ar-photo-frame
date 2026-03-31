import Canvas from "@/components/ui/Canvas";
import SaveButton from "@/components/ui/SaveButton";
import useGifAnimator from "@/hooks/useGifAnimator";
import useGifCompositor from "@/hooks/useGifCompositor";
import useGifEncoder from "@/hooks/useGifEncoder";
import useOnSave from "@/hooks/useOnSave";
import style from "@/styles/page.module.css";
import ShutterFadeOut from "@/components/ui/ShutterFadeOut";
import ProgressIndicator from "@/components/ui/ProgressIndicator";
import useArPhotoFrameContext from "@/hooks/useArPhotoFrameContext";

const SaveImage = () => {
  const { capturedCanvas, overlayGif } = useArPhotoFrameContext();
  const { combineGif } = useGifCompositor(overlayGif, capturedCanvas);
  const { canvasRef, onMount } = useGifAnimator(combineGif);
  const { blob, error } = useGifEncoder(combineGif);
  const { onSave } = useOnSave(blob, ".gif");
  const hasInvalidState = !capturedCanvas || !overlayGif;

  return (
    <div className={style.body}>
      <div className={style.container}>
        {hasInvalidState && (
          <div className={style["mini-progress-indicator"]} data-testid="save-page-error-message">
            画像データが見つかりません。最初からやり直してください。
          </div>
        )}
        {combineGif && (
          <>
            <Canvas
              canvasRef={canvasRef}
              onMount={onMount}
              className={style["canvas"]}
              testId="save-preview-canvas"
            />
            <ProgressIndicator
              isLoading={!error && !blob}
              className={style["mini-progress-indicator"]}
              testId="encoding-progress-indicator">
              GIFにエンコード中...
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
      {combineGif && <ShutterFadeOut />}
    </div>
  );
};

export default SaveImage;
