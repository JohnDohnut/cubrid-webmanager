import React, { useRef, useCallback } from "react";
import styles from "./HorizontalResize.module.css";

const HorizontalResize = ({ onChangeHeight, onRelease, currentHeight }) => {
    const startY = useRef(0);
    const startHeight = useRef(0);
    const isDragging = useRef(false);
    const frameRef = useRef(null);
    let newHeight = 0
    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        isDragging.current = true;

        // Use actual panel height, not fixed 200
        startY.current = e.clientY;
        startHeight.current = currentHeight;

        const handleMouseMove = (moveEvent) => {
            if (!isDragging.current) return;
            const delta = moveEvent.clientY - startY.current;
            newHeight = Math.max(0, startHeight.current + delta);

            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            frameRef.current = requestAnimationFrame(() => {
                onChangeHeight(newHeight);
            });
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            onRelease(newHeight);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    }, [onChangeHeight, currentHeight]);

    return (
        <div
            className={styles.resize__line}
            onMouseDown={handleMouseDown}
        />
    );
};

export default HorizontalResize