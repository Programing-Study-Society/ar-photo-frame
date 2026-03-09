import GifFrameScreen from "@/components/page/GifFrame";
import PngFrameScreen from "@/components/page/PngFrame";
import FaceFrameScreen from "@/components/page/FaceFrame";
import { imagesData } from "@/data/images";

const ArPhotoFramePage = ({ fileUrl, width, height, aspectRatio, type }: ArPhotoFramePageProps) => {
  return type === "png" ? (
    <PngFrameScreen fileUrl={fileUrl} width={width} height={height} aspectRatio={aspectRatio} />
  ) : type === "gif" ? (
    <GifFrameScreen fileUrl={fileUrl} width={width} height={height} aspectRatio={aspectRatio} />
  ) : (
    <FaceFrameScreen fileUrl={fileUrl} width={width} height={height} aspectRatio={aspectRatio} />
  );
};

export async function getStaticPaths() {
  return {
    paths: imagesData.map((imageData) => ({
      params: { id: imageData.id },
    })),
    fallback: false,
  };
}

export const getStaticProps = async ({ params }: { params: { id: string } }) => {
  if (!params?.id) return { notFound: true };

  const imageData = imagesData.find((image) => image.id === params.id);
  if (!imageData) return { notFound: true };

  return {
    props: {
      fileUrl: imageData.fileUrl,
      width: imageData.width,
      height: imageData.height,
      aspectRatio: imageData.aspectRatio,
      type: imageData.type,
    },
  };
};

export default ArPhotoFramePage;
