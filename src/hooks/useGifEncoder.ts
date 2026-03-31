import { encodeGif } from "@/utils/gifEncoder";
import { useState, useEffect } from "react";

const useGifEncoder = (gif: Gif | null) => {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBlob(null);
    setError(null);
    if (gif) {
      encodeGif(gif)
        .then((blob) => {
          setBlob(blob);
        })
        .catch(() => {
          setError("GIFのエンコードに失敗しました。");
        });
    }
  }, [gif]);

  return { blob, error };
};

export default useGifEncoder;
