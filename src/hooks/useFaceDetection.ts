import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { loadModels } from "@/utils/mediapipe";
import { FaceDetector } from "@mediapipe/tasks-vision";

export const useFaceDetection = (webcamRef: React.RefObject<Webcam | null>, fileUrl: string) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = fileUrl;
    img.onload = () => setImage(img);
  }, [fileUrl]);

  useEffect(() => {
    loadModels().then((faceDetector) => {
      setFaceDetector(faceDetector);
      setModelsLoaded(true);
    });
  }, []);

  const detectFaces = useCallback(
    (mirrored: boolean) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      const canvas = canvasRef.current;
      const webcam = webcamRef.current;
      if (!faceDetector || !canvas || !image || !webcam) {
        setTimeout(() => detectFaces(mirrored), 100);
        return;
      }
      const video = webcam.video;
      if (!video || video.readyState !== 4 || video.videoWidth === 0 || video.videoHeight === 0) {
        setTimeout(() => detectFaces(mirrored), 100);
        return;
      }
      const context = canvas.getContext("2d");
      if (!context) {
        setTimeout(() => detectFaces(mirrored), 100);
        return;
      }
      
      // Canvas のサイズをビデオストリームの実際のサイズに設定
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      // 顔検出用の一時Canvas（ビデオ画像を描画して検出に使用）
      const detectionCanvas = document.createElement("canvas");
      detectionCanvas.width = videoWidth;
      detectionCanvas.height = videoHeight;
      const detectionCtx = detectionCanvas.getContext("2d");
      if (!detectionCtx) {
        setTimeout(() => detectFaces(mirrored), 100);
        return;
      }
      
      const processDetection = () => {
        if (
          video.videoWidth !== 0 &&
          video.videoHeight !== 0
        ) {
          // 顔検出用の一時Canvasにビデオを描画
          detectionCtx.clearRect(0, 0, detectionCanvas.width, detectionCanvas.height);
          if (mirrored) {
            detectionCtx.save();
            detectionCtx.scale(-1, 1);
            detectionCtx.translate(-detectionCanvas.width, 0);
          }
          detectionCtx.drawImage(video, 0, 0, detectionCanvas.width, detectionCanvas.height);
          if (mirrored) {
            detectionCtx.restore();
          }
          
          // オーバーレイCanvasはクリア（透明にする）
          context.clearRect(0, 0, canvas.width, canvas.height);
          
          // 顔検出は一時Canvasで実行
          const detections = faceDetector.detect(detectionCanvas);
          detections.detections.forEach((detection) => {
            if (!detection.boundingBox) {
              return;
            }
            const { originX, originY, width, height } = detection.boundingBox;
            
            // 顔の中心にオーバーレイを描画（オーバーレイCanvasに）
            const centerX = originX + width / 2;
            const centerY = originY + height / 2;
            const overlaySize = width * 1.2;
            const overlayX = centerX - overlaySize / 2;
            const overlayY = centerY - overlaySize / 2;
            context.drawImage(image, overlayX, overlayY, overlaySize, overlaySize);
          });
        }
        animationFrameRef.current = requestAnimationFrame(processDetection);
      };

      processDetection();
    },
    [faceDetector, image, webcamRef]
  );

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return { canvasRef, modelsLoaded, detectFaces };
};
