import { decodeGif } from "@/utils/gifDecoder";
import { useState, useEffect } from "react";

const useGifDecoder = (file: Uint8Array | null) => {
  const [gif, setGif] = useState<Gif | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setGif(null);
    setError(null);
    if (file) {
      try {
        const gif = decodeGif(file);
        setGif(gif);
      } catch {
        setError("GIFのデコードに失敗しました。");
      }
    }
  }, [file]);

  return { gif, error };
};

export default useGifDecoder;
