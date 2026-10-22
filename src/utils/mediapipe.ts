import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

export const loadModels = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "/mediapipe/wasm"
  );
  const faceDetector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "models/blaze_face_short_range.tflite",
    },
    runningMode: "IMAGE",
  });

  return faceDetector
}
