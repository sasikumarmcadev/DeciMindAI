import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

export const BlinkingCursor = ({ className }: { className?: string }) => {
    const { theme } = useTheme();
    return (
        <span
            className={cn(
                "inline-block w-2 h-4 align-middle ml-1",
                "bg-black dark:bg-white animate-blink", // Simple blinking block
                className
            )}
        />
    );
};
