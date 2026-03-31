import { fetchFile } from "@/utils/fetchFile";
import { useState, useEffect } from "react";

const useFetchFile = (fileUrl: string) => {
  const [file, setFile] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFile(null);
    setError(null);
    fetchFile(fileUrl).then((file) => {
      if (!file) {
        setError("ファイルの取得に失敗しました。");
        return;
      }
      setFile(file);
    });
  }, [fileUrl]);

  return { file, error };
};

export default useFetchFile;
