import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ErrorPage from "next/error";
import { imagesData } from "@/data/images";
import styles from "@/styles/landing.module.css";

const formatTitle = (id: string) => {
  return id
    .split("_")
    .map((segment) => segment.replace(/-/g, " "))
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const getDisplayLabel = (image: { id: string; displayLabel?: string }) => {
  return image.displayLabel ?? formatTitle(image.id);
};

const getPreviewPath = (fileUrl: string) => {
  if (fileUrl.startsWith("/images/")) {
    return fileUrl;
  }

  if (fileUrl.startsWith("/")) {
    return `/images${fileUrl}`;
  }

  return `/images/${fileUrl}`;
};

const enabledImages = imagesData.filter((image) => image.enabled);

const LandingPage = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const debugParam = new URLSearchParams(window.location.search).get("debug");

  if (debugParam !== "true") {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <div className={styles.body}>
      <Head>
        <title>AR Photo Frame Templates</title>
        <meta
          name="description"
          content="各デザインにアクセスして、カメラで写真を撮影・保存できます。"
        />
      </Head>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>AR Photo Frame</h1>
          <p className={styles.lede}>
            下のカードからデザインを選んでください。
          </p>
          <p className={styles.lede}>
            隠しページ！！おめでとう！！
          </p>
        </header>

        <section className={styles.grid} aria-label="Available templates">
          {enabledImages.map((image) => (
            <Link
              key={image.id}
              href={`/${image.id}`}
              className={styles.card}
              aria-label={`Open ${image.id} frame`}
            >
              <div className={styles.previewWrapper}>
                <Image
                  src={getPreviewPath(image.fileUrl)}
                  alt={getDisplayLabel(image)}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loading="lazy"
                  className={styles.preview}
                />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardTitle}>{getDisplayLabel(image)}</div>
                <div className={styles.meta}>
                  <span className={styles.typeTag}>{image.type}</span>
                  <span>{`${image.width}×${image.height}`}</span>
                </div>
                <p className={styles.description}>
                  {image.type === "gif" ? "GIFアニメーションをカメラに重ねて保存" : "静止画オーバーレイ"}
                </p>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
