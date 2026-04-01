import '@/styles/reset.css';
import '@/styles/global.css';
import Head from "next/head";
import { AppProps } from 'next/app';
import { ArPhotoFrameProvider } from '@/contexts/ArPhotoFrameContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
      </Head>
      <ArPhotoFrameProvider>
        <Component {...pageProps} />
      </ArPhotoFrameProvider>
    </>
  );
}

export default MyApp;
