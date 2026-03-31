import React from "react";
import Image from "next/image";
import style from "@/styles/cameraToggleFacingButton.module.css";
import { classNames } from "@/utils/classNames";

const CameraToggleFacingButton = ({
  onClick,
  className,
  testId,
  ariaLabel = "カメラ切替",
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={classNames(style["button"], className)}
      data-testid={testId}
      aria-label={ariaLabel}>
      <Image src="/icons/switch_camera.svg" alt="カメラ切替" layout='fill' className={style["icon"]} />
    </button>
  );
};

export default CameraToggleFacingButton;
