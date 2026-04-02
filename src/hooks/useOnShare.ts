import { formatDate } from '@/utils/formatDate';
import { useCallback, useMemo } from 'react';

const useOnShare = (blob: Blob | null, extension: string) => {
  const fileName = useMemo(() => 'oecu_' + formatDate() + extension, [extension]);

  const canShare = useMemo(() => {
    if (!blob) {
      return false;
    }

    if (typeof navigator === 'undefined' || typeof File === 'undefined') {
      return false;
    }

    if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') {
      return false;
    }

    try {
      const file = new File([blob], fileName, {
        type: blob.type,
      });

      return navigator.canShare({ files: [file] });
    } catch {
      return false;
    }
  }, [blob, fileName]);

  const onShare = useCallback(() => {
    if (!blob) {
      return;
    }

    if (typeof navigator === 'undefined' || typeof File === 'undefined') {
      return;
    }

    const file = new File([blob], fileName, {
      type: blob.type,
    });

    void navigator
      .share({
        files: [file],
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      });
  }, [blob, fileName]);

  return { canShare, onShare };
};

export default useOnShare;