import { encodePng } from "@/utils/pngEncoder";
import { useState, useEffect } from "react";

const useGifEncoder = (ImageData: ImageData | null) => {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBlob(null);
    setError(null);
    if (ImageData) {
      encodePng(ImageData)
        .then((blob) => {
          setBlob(blob);
        })
        .catch(() => {
          setError("PNGのエンコードに失敗しました。");
        });
    }
  }, [ImageData]);

  return { blob, error };
};

export default useGifEncoder;
