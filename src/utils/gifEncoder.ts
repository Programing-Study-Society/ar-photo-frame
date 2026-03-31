import GIF from 'gif.js';

export const encodeGif = (gif: Gif): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const newGif = new GIF({
      workers: 4,
      quality: 30,
      width: gif.width,
      height: gif.height
    });

    gif.frames.forEach((frame) => {
      newGif.addFrame(frame.imageData, {delay: frame.delay, copy: true});
    });

    newGif.on("finished", (blob: Blob) => {
      resolve(blob);
    });
    newGif.on("abort", () => {
      reject(new Error("GIFエンコードが中断されました。"));
    });

    newGif.render();
  });
};
