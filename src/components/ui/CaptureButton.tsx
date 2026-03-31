import React from "react";
import style from "@/styles/captureButton.module.css";
import { classNames } from "@/utils/classNames";

const CaptureButton = ({ onClick, className, testId, ariaLabel = "撮影" }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={classNames(style["button"], className)}
      data-testid={testId}
      aria-label={ariaLabel}
    />
  );
};

export default CaptureButton;
