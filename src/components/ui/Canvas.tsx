import style from '@/styles/canvas.module.css'
import { classNames } from '@/utils/classNames';
import { useEffect } from "react";

const Canvas = ({ canvasRef, onMount, className, testId }: CanvasProps) => {
  useEffect(() => {
    if (onMount) {
      onMount();
    }
  }, [onMount]);

  return (
    <canvas
      ref={canvasRef}
      className={classNames(style.canvas, className)}
      data-testid={testId}
      ></canvas>
  )
}

export default Canvas
