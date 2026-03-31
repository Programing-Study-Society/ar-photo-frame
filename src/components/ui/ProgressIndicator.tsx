import styles from "@/styles/progressIndicator.module.css";
import { classNames } from "@/utils/classNames";

const ProgressIndicator = ({ isLoading, children, className, testId }: ProgressIndicatorProps) => {
  return (
    <>
      {isLoading && (
        <div className={classNames(styles["indicator-container"], className)} data-testid={testId}>
          <div className={styles["indicator-wrapper"]}>
            <div className={styles["indicator"]}></div>
            {children && <div className={styles["indicator-text"]}>{children}</div>}
          </div>
        </div>
      )}
    </>
  );
};

export default ProgressIndicator;
