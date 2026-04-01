import { formatDate } from '@/utils/formatDate';
import { useCallback, useMemo } from 'react';

type SaveFilePickerOptions = {
  suggestedName?: string;
  types?: Array<{
    description?: string;
    accept?: Record<string, string[]>;
  }>;
};

type SaveFilePickerWindow = Window & {
  showSaveFilePicker: (options: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
};

const useOnSaveToLocation = (blob: Blob | null, extension: string) => {
  const fileName = useMemo(() => 'oecu_' + formatDate() + extension, [extension]);

  const canSaveToLocation = useMemo(() => {
    return typeof window !== 'undefined' && 'showSaveFilePicker' in window && Boolean(blob);
  }, [blob]);

  const onSaveToLocation = useCallback(async () => {
    if (!blob || typeof window === 'undefined' || !('showSaveFilePicker' in window)) {
      return;
    }

    try {
      const { showSaveFilePicker } = window as SaveFilePickerWindow;
      const fileHandle = await showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: blob.type || 'Image',
            accept: {
              [blob.type || 'application/octet-stream']: [extension],
            },
          },
        ],
      });

      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      const link = document.createElement('a');
      document.body.appendChild(link);
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }
  }, [blob, extension, fileName]);

  return { canSaveToLocation, onSaveToLocation };
};

export default useOnSaveToLocation;