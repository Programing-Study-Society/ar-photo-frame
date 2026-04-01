import ShareButton from "@/components/ui/ShareButton";
import style from "@/styles/saveActionDialog.module.css";

const SaveActionDialog = ({
  isOpen,
  canShare,
  canSaveToLocation,
  onClose,
  onShare,
  onSaveToLocation,
  onDownload,
}: {
  isOpen: boolean;
  canShare: boolean;
  canSaveToLocation: boolean;
  onClose: () => void;
  onShare: () => void;
  onSaveToLocation: () => void | Promise<void>;
  onDownload: () => void;
}) => {
  if (!isOpen) {
    return null;
  }

  const handleShare = () => {
    onClose();
    onShare();
  };

  const handleSaveToLocation = () => {
    onClose();
    void onSaveToLocation();
  };

  const handleDownload = () => {
    onClose();
    onDownload();
  };

  const iconProps = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
  } as const;

  return (
    <div className={style.overlay} onClick={onClose} role="presentation">
      <div
        className={style.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={style.title}>保存方法を選択</div>
        <div className={style.actions}>
          {canShare && (
            <ShareButton onClick={handleShare} className={style.button} />
          )}
          <button
            type="button"
            onClick={handleDownload}
            className={style.button}
          >
            <svg {...iconProps}>
              <path d="M12 3a1 1 0 0 1 1 1v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42L11 12.59V4a1 1 0 0 1 1-1zm-7 14a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" fill="currentColor" />
            </svg>
            ダウンロード
          </button>

          {canSaveToLocation && (
            <button
              type="button"
              onClick={handleSaveToLocation}
              className={style.button}
            >
              <svg {...iconProps}>
                <path d="M12 2a1 1 0 0 1 1 1v10.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42L11 13.59V3a1 1 0 0 1 1-1zm-7 15a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" fill="currentColor" />
              </svg>
              保存先を指定
            </button>
          )}
        </div>
        <button type="button" onClick={onClose} className={style.cancelButton}>
          閉じる
        </button>
      </div>
    </div>
  );
};

export default SaveActionDialog;
