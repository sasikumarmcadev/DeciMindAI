import React from "react";
import { cn } from "@/lib/utils";
import { FileCode, ArrowRight } from "lucide-react";

interface CodeCardProps extends React.HTMLAttributes<HTMLDivElement> {
    language: string;
    code: string;
    filename?: string;
    onClick?: () => void;
}

export const CodeCard = ({
    language,
    code,
    filename,
    onClick,
    className,
    ...props
}: CodeCardProps) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative flex items-center justify-between w-full p-4 bg-background dark:bg-[#0d1117] border border-border hover:bg-accent/50 transition-colors duration-200 rounded-xl cursor-pointer mt-2 shadow-sm",
                className
            )}
            {...props}
        >
            <div className="flex flex-col gap-1 min-w-0 flex-1 pr-4">
                <span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {filename || language}
                </span>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Code
                </span>
            </div>

            <div className="w-14 h-12 rounded-lg bg-muted/40 border border-border flex flex-col items-start justify-center gap-1.5 p-2 overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-1 rounded-full bg-foreground/20 group-hover:bg-primary/40 transition-colors" />
                <div className="w-6 h-1 rounded-full bg-foreground/20 group-hover:bg-primary/40 transition-colors" />
                <div className="w-10 h-1 rounded-full bg-foreground/20 group-hover:bg-primary/40 transition-colors" />
            </div>
        </div>
    );
};
