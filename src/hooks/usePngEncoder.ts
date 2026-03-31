import { encodePng } from "@/utils/pngEncoder";
import { useState, useEffect } from "react";

const usePngEncoder = (imageData: ImageData | null) => {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBlob(null);
    setError(null);
    if (imageData) {
      encodePng(imageData)
        .then((blob) => {
          setBlob(blob);
        })
        .catch(() => {
          setError("PNGのエンコードに失敗しました。");
        });
    }
  }, [imageData]);

  return { blob, error };
};

export default usePngEncoder;
