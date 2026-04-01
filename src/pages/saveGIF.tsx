import Canvas from "@/components/ui/Canvas";
import SaveButton from "@/components/ui/SaveButton";
import SaveActionDialog from "@/components/ui/SaveActionDialog";
import useGifAnimator from "@/hooks/useGifAnimator";
import useGifCompositor from "@/hooks/useGifCompositor";
import useGifEncoder from "@/hooks/useGifEncoder";
import useOnSave from "@/hooks/useOnSave";
import useOnSaveToLocation from "@/hooks/useOnSaveToLocation";
import useOnShare from "@/hooks/useOnShare";
import style from "@/styles/page.module.css";
import ShutterFadeOut from "@/components/ui/ShutterFadeOut";
import ProgressIndicator from "@/components/ui/ProgressIndicator";
import useArPhotoFrameContext from "@/hooks/useArPhotoFrameContext";
import { useState } from "react";

const SaveImage = () => {
  const { capturedCanvas, overlayGif } = useArPhotoFrameContext();
  const { combineGif } = useGifCompositor(overlayGif, capturedCanvas);
  const { canvasRef, onMount } = useGifAnimator(combineGif);
  const { blob } = useGifEncoder(combineGif);
  const { onSave } = useOnSave(blob, ".gif");
  const { canShare, onShare } = useOnShare(blob, ".gif");
  const { canSaveToLocation, onSaveToLocation } = useOnSaveToLocation(blob, ".gif");
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

  const shouldOpenActionDialog = canShare || canSaveToLocation;

  const handleSaveClick = () => {
    if (!blob) {
      return;
    }

    if (shouldOpenActionDialog) {
      setIsActionDialogOpen(true);
      return;
    }

    onSave();
  };

  return (
    <div className={style.body}>
      <div className={style.container}>
        {combineGif && (
          <>
            <Canvas canvasRef={canvasRef} onMount={onMount} className={style["canvas"]} />
            <ProgressIndicator isLoading={!blob} className={style["mini-progress-indicator"]}>
              GIFにエンコード中...
            </ProgressIndicator>
            {blob && <SaveButton onClick={handleSaveClick} className={style["save-button"]} />}
            <SaveActionDialog
              isOpen={isActionDialogOpen}
              canShare={canShare}
              canSaveToLocation={canSaveToLocation}
              onClose={() => setIsActionDialogOpen(false)}
              onShare={onShare}
              onSaveToLocation={onSaveToLocation}
              onDownload={onSave}
            />
          </>
        )}
      </div>
      {combineGif && <ShutterFadeOut />}
    </div>
  );
};

export default SaveImage;
