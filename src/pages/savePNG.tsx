import Canvas from "@/components/ui/Canvas";
import SaveButton from "@/components/ui/SaveButton";
import SaveActionDialog from "@/components/ui/SaveActionDialog";
import useImageDataCompositor from "@/hooks/useImageDataCompositor";
import usePngEncoder from "@/hooks/usePngEncoder";
import useOnSave from "@/hooks/useOnSave";
import useOnSaveToLocation from "@/hooks/useOnSaveToLocation";
import useOnShare from "@/hooks/useOnShare";
import style from "@/styles/page.module.css";
import ShutterFadeOut from "@/components/ui/ShutterFadeOut";
import ProgressIndicator from "@/components/ui/ProgressIndicator";
import useArPhotoFrameContext from "@/hooks/useArPhotoFrameContext";
import useDrawImageData from "@/hooks/useDrawImageData";
import { useState } from "react";

const SaveImage = () => {
  const { capturedCanvas, overlayCanvas } = useArPhotoFrameContext();
  const { combinedImageData } = useImageDataCompositor(capturedCanvas, overlayCanvas);
  const { canvasRef } = useDrawImageData(combinedImageData);
  const { blob } = usePngEncoder(combinedImageData);
  const { onSave } = useOnSave(blob, ".png");
  const { canShare, onShare } = useOnShare(blob, ".png");
  const { canSaveToLocation, onSaveToLocation } = useOnSaveToLocation(blob, ".png");
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
      <div className={style["container"]}>
        {combinedImageData && (
          <>
            <Canvas canvasRef={canvasRef} className={style["canvas"]} />
            <ProgressIndicator isLoading={!blob} className={style["mini-progress-indicator"]}>
              PNGにエンコード中...
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
      {combinedImageData && <ShutterFadeOut />}
    </div>
  );
};

export default SaveImage;
