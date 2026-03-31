import style from "@/styles/shutter.module.css";

const ShutterFadeIn = ({ isActive, children }: ShutterFadeInProps) => {
  return (
    <>
      {isActive && (
        <div className={`${style["shutter"]} ${style["shutter-fade-in"]}`} data-testid="shutter-fade-in">
          <div className={style["content-fade-in"]}>{children}</div>
        </div>
      )}
    </>
  );
};

export default ShutterFadeIn;
