import Webcam from "react-webcam";
import style from "@/styles/camera.module.css";
import { classNames } from "@/utils/classNames";

const Camera = ({
  webcamRef,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  width: _width,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  height: _height,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  aspectRatio: _aspectRatio,
  videoConstraints,
  facingMode,
  isCameraReady,
  onUserMedia,
  onUserMediaError,
  className,
}: CameraProps) => {
  return (
    <Webcam
      key={JSON.stringify(videoConstraints)}
      audio={false}
      ref={webcamRef}
      forceScreenshotSourceSize={true}
      videoConstraints={videoConstraints}
      className={classNames(style["camera"], className)}
      onUserMedia={onUserMedia}
      onUserMediaError={onUserMediaError}
      mirrored={facingMode === "user"}
      style={{
        display: isCameraReady ? "" : "none",
      }}
    />
  );
};

export default Camera;
