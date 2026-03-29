import '@/styles/reset.css';
import '@/styles/global.css';
import React from "react";
import { AppProps } from 'next/app';
import { ArPhotoFrameProvider } from '@/contexts/ArPhotoFrameContext';

function MyApp({ Component, pageProps }: AppProps) {
  return React.createElement(
    ArPhotoFrameProvider,
    null,
    React.createElement(Component, pageProps)
  );
}

export default MyApp;
