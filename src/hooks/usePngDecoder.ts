import { decodePng } from "@/utils/pngDecoder";
import { useState, useEffect } from "react";

const usePngDecoder = (file: Uint8Array | null) => {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImageData(null);
    setError(null);
    if (file) {
      decodePng(file)
        .then((imageData) => {
          setImageData(imageData);
        })
        .catch(() => {
          setError("PNGのデコードに失敗しました。");
        });
    }
  }, [file]);

  return { imageData, error };
};

export default usePngDecoder;
