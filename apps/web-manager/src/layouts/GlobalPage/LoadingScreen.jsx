import React from "react";
import { Spin } from "antd";
import styles from "./LoadingScreen.module.css";

const LoadingScreen = () => {
    return (
        <div className={styles.loadingContainer}>
            <Spin
                indicator={
                    <div className={styles.customIndicator}>
                        <div className={styles.dot}></div>
                        <div className={styles.dot}></div>
                        <div className={styles.dot}></div>
                    </div>
                }
                size="large"
                className={styles.spinFix}
            />
        </div>
    );
}

export default LoadingScreen;