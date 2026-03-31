import React from "react";
import style from "@/styles/saveButton.module.css";
import { classNames } from "@/utils/classNames";

const SaveButton = ({ onClick, className, testId, ariaLabel = "保存" }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={classNames(style["button"], className)}
      data-testid={testId}
      aria-label={ariaLabel}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={style.icon}
      >
        <path d="M12 16l4-5h-3V4h-2v7H8l4 5zm-7 2v2h14v-2H5z" />
      </svg>
      保存
    </button>
  );
};

export default SaveButton;
