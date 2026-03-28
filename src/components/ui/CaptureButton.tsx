import React from "react";
import style from "@/styles/captureButton.module.css";
import { classNames } from "@/utils/classNames";

const CaptureButton = ({ onClick, className }: ButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="撮影する"
      className={classNames(style["button"], className)}
    />
  );
};

export default CaptureButton;
