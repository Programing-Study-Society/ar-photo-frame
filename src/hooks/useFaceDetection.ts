import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { loadModels } from "@/utils/mediapipe";
import { FaceDetector } from "@mediapipe/tasks-vision";

export const useFaceDetection = (webcamRef: React.RefObject<Webcam | null>, fileUrl: string) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = fileUrl;
    img.onload = () => setImage(img);
  }, [fileUrl]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.__ARPF_E2E_FACE_MOCK__) {
      const mockFaceDetector = {
        detect: () => ({ detections: [] }),
      } as unknown as FaceDetector;
      setFaceDetector(mockFaceDetector);
      setModelsLoaded(true);
      setModelError(null);
      return;
    }
    loadModels()
      .then((faceDetector) => {
        setFaceDetector(faceDetector);
        setModelsLoaded(true);
        setModelError(null);
      })
      .catch(() => {
        setModelsLoaded(false);
        setModelError("モデルのロードに失敗しました。");
      });
  }, []);

  const detectFaces = useCallback(
    (mirrored: boolean) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      const canvas = canvasRef.current;
      const webcam = webcamRef.current;
      if (modelError) {
        return;
      }
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
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
    [faceDetector, image, webcamRef, modelError]
  );

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return { canvasRef, modelsLoaded, modelError, detectFaces };
};
