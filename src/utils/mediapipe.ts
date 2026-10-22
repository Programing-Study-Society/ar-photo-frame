import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

export const loadModels = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"
  );
  const faceDetector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "models/blaze_face_short_range.tflite",
    },
    runningMode: "IMAGE",
  });

  return faceDetector
}
