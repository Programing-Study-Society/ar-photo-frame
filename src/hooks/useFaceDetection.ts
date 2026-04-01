import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { loadModels } from "@/utils/mediapipe";
import { FaceDetector } from "@mediapipe/tasks-vision";
import { calculateCoverTransform } from "@/utils/calculateCoverTransform";

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
      
      // 表示領域のサイズを取得（object-fit: cover での表示領域）
      const displayWidth = video.clientWidth || videoWidth;
      const displayHeight = video.clientHeight || videoHeight;
      
      // object-fit: cover での座標変換を計算
      const { scale, offsetX, offsetY } = calculateCoverTransform(
        videoWidth,
        videoHeight,
        displayWidth,
        displayHeight
      );
      
      const processDetection = () => {
        if (
          video.videoWidth !== 0 &&
          video.videoHeight !== 0
        ) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          if (mirrored) {
            context.save();
            context.scale(-1, 1);
            context.translate(-canvas.width, 0);
          }
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          if (mirrored) {
            context.restore();
          }
          const detections = faceDetector.detect(canvas);
          detections.detections.forEach((detection) => {
            if (!detection.boundingBox) {
              return;
            }
            const { originX, originY, width, height } = detection.boundingBox;
            
            // object-fit: cover の座標変換を適用
            // 検出座標は Canvas 全体を基準にしているため、表示領域内の座標に変換
            const adjustedX = originX - offsetX;
            const adjustedY = originY - offsetY;
            const adjustedWidth = width;
            const adjustedHeight = height;
            
            // 表示領域外の顔は無視（クロップされた部分）
            if (
              adjustedX + adjustedWidth < 0 ||
              adjustedY + adjustedHeight < 0 ||
              adjustedX > displayWidth / scale ||
              adjustedY > displayHeight / scale
            ) {
              return;
            }
            
            const centerX = adjustedX + adjustedWidth / 2;
            const centerY = adjustedY + adjustedHeight / 2;
            const overlaySize = adjustedWidth * 1.2;
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
