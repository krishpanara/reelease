"use client";

import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';

const WaveCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const { theme, systemTheme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const updateSize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

        const getPartitionColor = (index: number, total: number, isRightSide: boolean) => {
            const ratio = index / total;
            let r, g, b;

            if (!isRightSide) {
                // Top-Left Partition: Blue -> Purple -> Pink (Matches Figma)
                if (ratio < 0.5) {
                    const subRatio = ratio / 0.5;
                    r = 80 + (160 - 80) * subRatio;
                    g = 120 + (80 - 120) * subRatio;
                    b = 255;
                } else {
                    const subRatio = (ratio - 0.5) / 0.5;
                    r = 160 + (255 - 160) * subRatio;
                    g = 80 + (120 - 80) * subRatio;
                    b = 255 + (180 - 255) * subRatio;
                }
            } else {
                // Bottom-Right Partition: Red/Orange -> Purple -> Neon Blue (Matches Figma)
                if (ratio < 0.5) {
                    const subRatio = ratio / 0.5;
                    r = 255 + (180 - 255) * subRatio;
                    g = 80 + (60 - 80) * subRatio;
                    b = 100 + (200 - 100) * subRatio;
                } else {
                    const subRatio = (ratio - 0.5) / 0.5;
                    r = 180 + (100 - 180) * subRatio;
                    g = 60 + (120 - 60) * subRatio;
                    b = 200 + (255 - 200) * subRatio;
                }
            }
            
            return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${isDark ? 0.35 : 0.6})`;
        };

        const drawPartition = (isRightSide: boolean, t: number) => {
            const numberOfWaves = 40;
            
            for (let i = 0; i < numberOfWaves; i++) {
                ctx.beginPath();
                
                // This sine wave twists the lines into a 3D tube/mesh effect
                const mathOffset = i * (canvas.height * 0.012) * Math.sin(i * 0.15 + t * 0.5);
                
                // Keep the origin anchored similarly to the SVG
                const startX = -100;
                const startY = canvas.height * 0.2 + (i * 3) + Math.sin(t) * 15;
                ctx.moveTo(startX, startY);

                // Control points that sweep the mesh into exactly the shape of the Figma paths
                const cp1x = canvas.width * 0.35 + Math.sin(t * 0.4) * 40;
                const cp1y = canvas.height * 0.05 + mathOffset;
                
                const cp2x = canvas.width * 0.15 + Math.cos(t * 0.5) * 40;
                const cp2y = canvas.height * 0.7 + mathOffset;
                
                const endX = canvas.width * 0.45 + Math.sin(t * 0.6) * 30;
                const endY = canvas.height + 100;

                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
                ctx.strokeStyle = getPartitionColor(i, numberOfWaves, isRightSide);
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Draw Top-Left Group
            ctx.save();
            drawPartition(false, time);
            ctx.restore();

            // 2. Draw Bottom-Right Group using canvas rotation
            ctx.save();
            ctx.translate(canvas.width, canvas.height);
            ctx.rotate(Math.PI);
            drawPartition(true, time);
            ctx.restore();
            
            time += 0.005; // Playback speed
            animationFrameId = requestAnimationFrame(animate);
        };

        updateSize();
        animate();

        window.addEventListener('resize', updateSize);
        return () => {
            window.removeEventListener('resize', updateSize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme, systemTheme]);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <canvas
                ref={canvasRef}
                className="block w-full h-full"
            />
        </div>
    );
};

export default WaveCanvas;
