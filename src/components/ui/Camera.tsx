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
  onUserMediaError,
  className,
  testId,
}: CameraProps) => {
  const videoConstraints: MediaTrackConstraints = {
    width: { ideal: width },
    height: { ideal: height },
    aspectRatio: { exact: aspectRatio },
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
      onUserMediaError={onUserMediaError}
      mirrored={facingMode === "user"}
      data-testid={testId}
      style={{
        display: isCameraReady ? "" : "none",
      }}
    />
  );
};

export default Camera;
