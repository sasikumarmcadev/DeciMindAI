'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClickSparkProps {
    children?: React.ReactNode;
    sparkColor?: string;
    sparkSize?: number;
    sparkRadius?: number;
    sparkCount?: number;
    duration?: number;
}

interface Spark {
    id: number;
    x: number;
    y: number;
}

const SparkGroup = ({ x, y, color, size, radius, count, duration }: { x: number, y: number, color: string, size: number, radius: number, count: number, duration: number }) => {
    return (
        <div
            style={{
                position: 'absolute',
                top: y,
                left: x,
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        >
            {Array.from({ length: count }).map((_, i) => {
                const angle = (i * 360) / count;
                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 1, scale: 0 }}
                        animate={{
                            opacity: 0,
                            scale: 1,
                            x: Math.cos((angle * Math.PI) / 180) * radius,
                            y: Math.sin((angle * Math.PI) / 180) * radius,
                        }}
                        transition={{ duration: duration / 1000, ease: "easeOut" }}
                        style={{
                            position: 'absolute',
                            top: '-10%',
                            left: '-10%',
                            width: size,
                            height: size,
                            borderRadius: '50%', // Circular sparks like small dots/stars
                            backgroundColor: color,
                        }}
                    />
                );
            })}
        </div>
    );
};

const ClickSpark: React.FC<ClickSparkProps> = ({
    children,
    sparkColor = '#fff',
    sparkSize = 10,
    sparkRadius = 15,
    sparkCount = 8,
    duration = 400,
}) => {
    const [sparks, setSparks] = useState<Spark[]>([]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const newSpark = { id: Date.now(), x: e.clientX, y: e.clientY };
            setSparks(prev => [...prev, newSpark]);

            setTimeout(() => {
                setSparks(prev => prev.filter(s => s.id !== newSpark.id));
            }, duration);
        };

        window.addEventListener('click', handleClick);
        // Also listen for touch end to support mobile taps better if needed, but click usually fires.

        return () => {
            window.removeEventListener('click', handleClick);
        };
    }, [duration]);

    return (
        <>
            {children}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
                <AnimatePresence>
                    {sparks.map(spark => (
                        <SparkGroup
                            key={spark.id}
                            x={spark.x}
                            y={spark.y}
                            color={sparkColor}
                            size={sparkSize}
                            radius={sparkRadius}
                            count={sparkCount}
                            duration={duration}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </>
    );
};

export default ClickSpark;
