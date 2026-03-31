import style from "@/styles/shutter.module.css";

const ShutterFadeOut = ({ children }: ShutterFadeOutProps) => {
  return (
    <div className={`${style["shutter"]} ${style["shutter-fade-out"]}`} data-testid="shutter-fade-out">
      <div className={style["content-fade-out"]}>{children}</div>
    </div>
  );
};

export default ShutterFadeOut;
