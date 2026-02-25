'use client';
import React, { useState } from 'react';
// pptxgenjs is imported dynamically inside downloadPPT to avoid build-time node:fs issues
import { Button } from '@/components/ui/button';
import { Download, ChevronLeft, ChevronRight, Check, Play, Maximize, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface SlideData {
    title: string;
    points: string[];
    imageKeyword?: string;
}

export type PptTemplate = 'corporate' | 'modern' | 'vibrant' | 'dark';

export const TEMPLATES = {
    corporate: { name: 'Corporate Blue', bg: 'bg-[#1E3A8A]', text: 'text-white', hexBg: '1E3A8A', hexText: 'FFFFFF', bullet: 'FFFFFF' },
    modern: { name: 'Modern Light', bg: 'bg-white', text: 'text-gray-900', hexBg: 'FFFFFF', hexText: '111827', bullet: '3B82F6' },
    vibrant: { name: 'Vibrant Purple', bg: 'bg-gradient-to-br from-purple-600 to-indigo-700', text: 'text-white', hexBg: '6D28D9', hexText: 'FFFFFF', bullet: 'FCA5A5' },
    dark: { name: 'Sleek Dark', bg: 'bg-[#111827]', text: 'text-gray-100', hexBg: '111827', hexText: 'F9FAFB', bullet: '10B981' },
};

export interface PresentationData {
    title: string;
    slides: SlideData[];
}

export function SlideEditor({ slide, updateSlide, template }: { slide: SlideData, updateSlide: (slide: SlideData) => void, template: PptTemplate }) {
    const handleTitleChange = (e: React.FocusEvent<HTMLDivElement>) => {
        updateSlide({ ...slide, title: e.target.innerText });
    };

    const handlePointChange = (index: number, value: string) => {
        const updatedPoints = [...slide.points];
        updatedPoints[index] = value;
        updateSlide({ ...slide, points: updatedPoints });
    };

    const currentTheme = TEMPLATES[template];
    const imageUrl = slide.imageKeyword ? `https://image.pollinations.ai/prompt/${encodeURIComponent(slide.imageKeyword)}?width=800&height=600&nologo=true` : null;

    return (
        <div className={cn(
            "w-full max-w-[800px] aspect-video shadow-xl p-6 md:p-10 rounded-lg flex border transition-all duration-500 mx-auto relative group overflow-hidden",
            currentTheme.bg, currentTheme.text
        )}>
            {/* Visual background elements common in PPTs */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-lg z-0" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none z-0" />

            <div className="flex w-full gap-6 z-10 relative">
                {/* Text Content Area */}
                <div className={cn("flex flex-col justify-center flex-1", imageUrl ? "w-1/2" : "w-full")}>
                    {/* Editable Title */}
                    <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={handleTitleChange}
                        className={cn(
                            "text-2xl md:text-3xl lg:text-4xl font-bold outline-none border-b-2 border-transparent hover:border-white/20 focus:border-white/40 transition-colors pb-2 mb-4 md:mb-6",
                            template === 'modern' ? 'hover:border-blue-300' : ''
                        )}
                        dangerouslySetInnerHTML={{ __html: slide.title }}
                    />

                    {/* Editable Points */}
                    <ul className="space-y-2 md:space-y-3 relative z-10 flex-1 pl-2 md:pl-4">
                        {slide.points.map((point, index) => (
                            <li
                                key={index}
                                className="flex items-start text-sm md:text-base lg:text-lg leading-relaxed group/item"
                            >
                                <span className={cn("mr-3 font-bold mt-0.5", template === 'modern' ? 'text-blue-500' : 'text-current opacity-80')}>•</span>
                                <div
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => handlePointChange(index, e.target.innerText)}
                                    className="outline-none border-b border-transparent hover:border-white/20 focus:border-white/40 transition-colors flex-1 pb-1 opacity-90"
                                    dangerouslySetInnerHTML={{ __html: point }}
                                />
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 3rd Party Image Preview (if generated) */}
                {imageUrl && (
                    <div className="w-1/2 h-full flex items-center justify-center pointer-events-none relative rounded-lg overflow-hidden border border-white/10 shadow-sm">
                        {/* A loading placeholder underneath */}
                        <div className="absolute inset-0 bg-black/10 animate-pulse" />
                        <img
                            src={imageUrl}
                            alt={slide.imageKeyword || "Slide image"}
                            className="w-full h-full object-cover relative z-10"
                            crossOrigin="anonymous"
                        />
                        <div className="absolute bottom-2 right-2 z-20 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded opacity-50">
                            {slide.imageKeyword}
                        </div>
                    </div>
                )}
            </div>

            {/* Editor Hint Overlay */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[10px] px-2 py-1 rounded-md pointer-events-none z-20">
                Click text to edit
            </div>
        </div>
    );
}

export function PptPreview({
    initialData,
    topic
}: {
    initialData: PresentationData,
    topic: string
}) {
    const [data, setData] = useState<PresentationData>(initialData);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [template, setTemplate] = useState<PptTemplate>('corporate');
    const [isPresenting, setIsPresenting] = useState(false);

    // Handle keyboard navigation for presentation mode
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isPresenting) return;
            if (e.key === 'ArrowRight' || e.key === ' ') {
                setCurrentSlide(prev => Math.min(data.slides.length - 1, prev + 1));
            } else if (e.key === 'ArrowLeft') {
                setCurrentSlide(prev => Math.max(0, prev - 1));
            } else if (e.key === 'Escape') {
                setIsPresenting(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPresenting, data.slides.length]);

    const downloadPPT = async () => {
        setIsDownloading(true);
        try {
            const PptxGenJS = (await import('pptxgenjs')).default;
            let pptx = new PptxGenJS();
            pptx.author = "DeciMind AI";
            pptx.company = "DeciMind";
            pptx.title = data.title || `${topic} Presentation`;

            const currentTheme = TEMPLATES[template];

            // Wait for all slides to process (in case we need to fetch image base64, but pptxgenjs natively supports remote URL images!)
            data.slides.forEach((slideData) => {
                let slide = pptx.addSlide();

                // Apply Theme Background
                slide.background = { color: currentTheme.hexBg };

                // Strip HTML from title if user typed any accidentally
                const plainTitle = slideData.title.replace(/<[^>]*>?/gm, '');

                const hasImage = !!slideData.imageKeyword;
                const textWidth = hasImage ? '45%' : '90%';

                // Add Title
                slide.addText(plainTitle, {
                    x: 0.5,
                    y: 0.5,
                    w: textWidth,
                    h: 1,
                    fontSize: 32,
                    bold: true,
                    color: currentTheme.hexText,
                });

                // Add Content Points
                slideData.points.forEach((point, index) => {
                    const plainPoint = point.replace(/<[^>]*>?/gm, '');
                    slide.addText(plainPoint, {
                        x: 0.5,
                        y: 1.8 + index * 0.5,
                        w: textWidth,
                        h: 0.5,
                        fontSize: 18,
                        bullet: true,
                        color: currentTheme.hexText,
                        valign: 'top',
                        breakLine: true
                    });
                });

                // Add Image if exists
                if (hasImage) {
                    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(slideData.imageKeyword!)}?width=800&height=600&nologo=true`;
                    slide.addImage({
                        path: imageUrl,
                        x: 5.5,
                        y: 0.5,
                        w: 4.0,
                        h: 4.5,
                        sizing: { type: 'cover', w: 4.0, h: 4.5 }
                    });
                }
            });

            const fileName = `${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'presentation'}.pptx`;
            await pptx.writeFile({ fileName });
        } catch (error) {
            console.error("Error generating PPT:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    if (!data || !data.slides || data.slides.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No slides available to preview.</div>;
    }

    return (
        <div className="w-full flex flex-col gap-4 bg-[#f8f9fa] dark:bg-zinc-950 p-4 md:p-6 rounded-xl border mt-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 max-w-full">
                    <span className="truncate">{data.title || "Presentation Preview"}</span>
                </h3>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex bg-secondary/50 p-1 rounded-lg">
                        {(Object.keys(TEMPLATES) as PptTemplate[]).map(key => (
                            <button
                                key={key}
                                onClick={() => setTemplate(key)}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                                    template === key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {TEMPLATES[key].name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                    <div className="text-sm font-medium bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg flex items-center justify-center shrink-0">
                        {currentSlide + 1} / {data.slides.length}
                    </div>
                </div>
            </div>

            <div className="w-full overflow-hidden relative group rounded-lg">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <SlideEditor
                            slide={data.slides[currentSlide]}
                            template={template}
                            updateSlide={(updatedSlide) => {
                                const newSlides = [...data.slides];
                                newSlides[currentSlide] = updatedSlide;
                                setData({ ...data, slides: newSlides });
                            }}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Elements on top of slide for easy access on desktop */}
                <button
                    onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                    disabled={currentSlide === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center shadow-md disable:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity z-20 text-foreground"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setCurrentSlide(prev => Math.min(data.slides.length - 1, prev + 1))}
                    disabled={currentSlide === data.slides.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center shadow-md disable:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity z-20 text-foreground"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                {/* Mobile Navigation (always visible) */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                        disabled={currentSlide === 0}
                        className="w-full sm:w-auto"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                    </Button>
                    <div className="flex gap-1 overflow-x-auto max-w-[150px] scrollbar-hide shrink-0">
                        {data.slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all shrink-0",
                                    idx === currentSlide ? "bg-primary w-4" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                )}
                            />
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSlide(prev => Math.min(data.slides.length - 1, prev + 1))}
                        disabled={currentSlide === data.slides.length - 1}
                        className="w-full sm:w-auto"
                    >
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        onClick={() => setIsPresenting(true)}
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    >
                        <Play className="w-4 h-4" /> Present
                    </Button>
                    <Button
                        onClick={downloadPPT}
                        disabled={isDownloading}
                        className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white gap-2"
                    >
                        {isDownloading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        {isDownloading ? "Generating..." : "Download"}
                    </Button>
                </div>
            </div>

            {/* Full Screen Presentation Overlay */}
            <AnimatePresence>
                {isPresenting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-4 md:p-10"
                    >
                        <div className="absolute top-4 right-4 flex items-center gap-4 z-[10000]">
                            <div className="text-white/70 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                                Slide {currentSlide + 1} of {data.slides.length}
                            </div>
                            <button
                                onClick={() => setIsPresenting(false)}
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="w-full max-w-6xl h-full flex items-center justify-center relative group">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full"
                                >
                                    <SlideEditor
                                        slide={data.slides[currentSlide]}
                                        template={template}
                                        updateSlide={(updatedSlide) => {
                                            const newSlides = [...data.slides];
                                            newSlides[currentSlide] = updatedSlide;
                                            setData({ ...data, slides: newSlides });
                                        }}
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Presentation Controls Overlay */}
                            <button
                                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                                disabled={currentSlide === 0}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                            <button
                                onClick={() => setCurrentSlide(prev => Math.min(data.slides.length - 1, prev + 1))}
                                disabled={currentSlide === data.slides.length - 1}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        </div>

                        <div className="mt-8 flex gap-2">
                            {data.slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={cn(
                                        "w-2.5 h-2.5 rounded-full transition-all",
                                        idx === currentSlide ? "bg-white w-6" : "bg-white/20 hover:bg-white/40"
                                    )}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
