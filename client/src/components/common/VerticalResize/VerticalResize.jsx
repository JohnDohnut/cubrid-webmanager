import React, { useRef, useEffect } from "react";
import styles from "./VerticalResize.module.css";

const VerticalResize = ({ defaultWidth = 200, onChangeWidth }) => {
    const widthRef = useRef(defaultWidth);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);
    const isDraggingRef = useRef(false);
    const frameRef = useRef(null);

    // Send initial width once
    useEffect(() => {
        onChangeWidth?.(defaultWidth);
    }, []);

    const handleMouseDown = (e) => {
        e.preventDefault();

        isDraggingRef.current = true;
        startXRef.current = e.clientX;
        startWidthRef.current = widthRef.current;

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!isDraggingRef.current) return;

        const delta = e.clientX - startXRef.current;
        const newWidth = Math.max(100, startWidthRef.current + delta);

        widthRef.current = newWidth;

        // Avoid spamming state updates → raf is smooth + performant
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(() => {
            onChangeWidth?.(widthRef.current);
        });
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    };

    return (
        <div
            className={styles.resize__vertical__line}
            onMouseDown={handleMouseDown}
        />
    );
};

export default React.memo(VerticalResize);
