import React, { ReactNode, RefObject } from "react";

declare global {
  interface Window {
    __ARPF_E2E_FACE_MOCK__?: boolean;
  }

  interface CameraProps {
    webcamRef: RefObject<Webcam | null>;
    width: number;
    height: number;
    aspectRatio: number;
    facingMode: CameraFacingMode;
    isCameraReady: boolean | null;
    onUserMedia?: (stream: MediaStream) => void;
    onUserMediaError?: (error: string | DOMException) => void;
    className?: string;
    testId?: string;
  }

  interface CanvasProps {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    onMount?: () => void;
    className?: string;
    testId?: string;
  }

  interface ButtonProps {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    className?: string;
    testId?: string;
    ariaLabel?: string;
  }

  interface GifCanvasProps {
    canvasRef: RefObject<HTMLCanvasElement | null>;
  }

  interface ProgressIndicatorProps {
    isLoading: boolean | null;
    children?: React.ReactNode;
    className?: string;
    testId?: string;
  }

  interface ShutterFadeInProps {
    isActive: boolean;
    children?: ReactNode;
  }

  interface ShutterFadeOutProps {
    children?: ReactNode;
  }

  interface ToggleSwitchProps {
    fileEncodeMode: FileType;
    setFileEncodeMode:React.Dispatch<React.SetStateAction<FileType>>;
    className?: string;
  }

  interface ArPhotoFrameProviderProps {
    children: ReactNode;
    className?: string;
  };

  interface ArPhotoFrameContextType {
    capturedCanvas: HTMLCanvasElement | null;
    setCapturedCanvas: React.Dispatch<React.SetStateAction<HTMLCanvasElement | null>>;
    overlayGif: Gif | null;
    setOverlayGif: React.Dispatch<React.SetStateAction<Gif | null>>;
    overlayCanvas: HTMLCanvasElement | null;
    setOverlayCanvas: React.Dispatch<React.SetStateAction<HTMLCanvasElement | null>>;
  };

  interface ArPhotoFramePageProps {
    fileUrl: string;
    width: number;
    height: number;
    aspectRatio: number;
    type: FileType;
  };

  interface FrameProps {
    fileUrl: string;
    width: number;
    height: number;
    aspectRatio: number;
  }

  interface GifFrame {
    imageData: ImageData;
    delay: number;
  }

  interface Gif {
    frames: GifFrame[];
    width: number;
    height: number;
    totalFrames: number;
  }

  type FileType = "png" | "gif" | "face";

  type CameraFacingMode = "user" | "environment"
}

export {};
