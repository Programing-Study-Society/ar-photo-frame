import Webcam from "react-webcam";
import style from "@/styles/camera.module.css";
import { classNames } from "@/utils/classNames";

const Camera = ({
  webcamRef,
  width,
  height,
  aspectRatio,
  facingMode,
  isCameraReady,
  onUserMedia,
  className,
}: CameraProps) => {
  const videoConstraints: MediaTrackConstraints = {
    width: { ideal: width },
    height: { ideal: height },
    aspectRatio: { ideal: aspectRatio },
    facingMode: { ideal: facingMode },
  };

  return (
    <Webcam
      audio={false}
      ref={webcamRef}
      forceScreenshotSourceSize={true}
      videoConstraints={videoConstraints}
      className={classNames(style["camera"], className)}
      onUserMedia={onUserMedia}
      mirrored={facingMode === "user"}
      style={{
        display: isCameraReady ? "" : "none",
      }}
    />
  );
};

export default Camera;
