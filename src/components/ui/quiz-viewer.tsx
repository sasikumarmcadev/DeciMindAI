"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw, Award, Lightbulb, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface QuizData {
    questions: Question[];
}

interface QuizViewerProps {
    data: QuizData;
    topic: string;
}

export function QuizViewer({ data, topic }: QuizViewerProps) {
    const [answers, setAnswers] = useState<{ [key: number]: number }>({});
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Track which questions have been locked (answered)
    const [lockedQuestions, setLockedQuestions] = useState<Set<number>>(new Set());

    const handleOptionSelect = (qIdx: number, oIdx: number) => {
        if (lockedQuestions.has(qIdx)) return;

        // Record the answer
        setAnswers(prev => ({ ...prev, [qIdx]: oIdx }));

        // Lock the question immediately
        setLockedQuestions(prev => {
            const next = new Set(prev);
            next.add(qIdx);
            return next;
        });

        // Update score if correct
        if (oIdx === data.questions[qIdx].correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    // Check if all questions are completed
    useEffect(() => {
        if (lockedQuestions.size === data.questions.length && data.questions.length > 0) {
            const timer = setTimeout(() => {
                setShowResults(true);
            }, 1500); // Small delay to let the user see the last explanation
            return () => clearTimeout(timer);
        }
    }, [lockedQuestions, data.questions.length]);

    const handleRestart = () => {
        setAnswers({});
        setScore(0);
        setLockedQuestions(new Set());
        setShowResults(false);
        setAnalysis(null);
    };

    useEffect(() => {
        if (showResults && !analysis && !isAnalyzing) {
            fetchAnalysis();
        }
    }, [showResults]);

    const fetchAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const res = await fetch("/api/analyze-quiz", {
                method: "POST",
                body: JSON.stringify({
                    score,
                    total: data.questions.length,
                    topic
                })
            });
            const result = await res.json();
            setAnalysis(result.analysis);
        } catch (error) {
            setAnalysis("Review the topic to strengthen your understanding.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (showResults) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full"
            >
                <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
                    <div className="text-center space-y-6">
                        {/* Score */}
                        <div>
                            <div className="text-5xl font-light text-gray-900 dark:text-gray-100">
                                {score}<span className="text-2xl text-gray-400 dark:text-gray-600">/{data.questions.length}</span>
                            </div>
                            <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-2">
                                Final Score
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gray-900 dark:bg-gray-100"
                                initial={{ width: 0 }}
                                animate={{ width: `${(score / data.questions.length) * 100}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                        </div>

                        {/* Analysis */}
                        <div className="pt-4">
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-3">
                                <Lightbulb className="w-3 h-3" />
                                <span>AI Analysis</span>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                                {isAnalyzing ? (
                                    <div className="flex justify-center gap-1">
                                        <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse" />
                                        <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse delay-75" />
                                        <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse delay-150" />
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {analysis}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowResults(false)}
                                className="flex-1 h-10 text-xs font-medium border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                            >
                                Review
                            </Button>
                            <Button
                                onClick={handleRestart}
                                className="flex-1 h-10 text-xs font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                            >
                                <RotateCcw className="w-3 h-3 mr-1.5" />
                                Retake
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    const progress = (lockedQuestions.size / data.questions.length) * 100;

    return (
        <div className="w-full space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        Assessment Paper
                    </span>
                    <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                        {lockedQuestions.size} / {data.questions.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {Math.round(progress)}%
                    </span>
                    <div className="w-16 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gray-900 dark:bg-gray-100"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-10">
                {data.questions.map((q, qIdx) => {
                    const isAnswered = lockedQuestions.has(qIdx);
                    const selectedIdx = answers[qIdx];
                    const isCorrect = isAnswered && selectedIdx === q.correctAnswer;

                    return (
                        <div key={qIdx} className="space-y-4">
                            {/* Question */}
                            <div className="flex items-start gap-3">
                                <span className={cn(
                                    "flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-medium",
                                    isAnswered
                                        ? isCorrect
                                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                                            : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                                        : "bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500"
                                )}>
                                    {qIdx + 1}
                                </span>
                                <h3 className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                                    {q.question}
                                </h3>
                            </div>

                            {/* Options */}
                            <div className="space-y-2 pl-9">
                                {q.options.map((option, oIdx) => {
                                    const isSelected = selectedIdx === oIdx;
                                    const isCorrectOption = isAnswered && oIdx === q.correctAnswer;
                                    const isWrongSelection = isAnswered && isSelected && oIdx !== q.correctAnswer;

                                    return (
                                        <button
                                            key={oIdx}
                                            onClick={() => handleOptionSelect(qIdx, oIdx)}
                                            disabled={isAnswered}
                                            className={cn(
                                                "w-full text-left px-4 py-3 rounded-lg border transition-all",
                                                !isAnswered && "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700",
                                                !isAnswered && isSelected && "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900",
                                                isAnswered && isCorrectOption && "border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20",
                                                isAnswered && isWrongSelection && "border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20",
                                                isAnswered && !isCorrectOption && !isWrongSelection && "border-gray-100 dark:border-gray-800 opacity-40"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        "text-xs font-medium",
                                                        isAnswered && isCorrectOption && "text-emerald-600 dark:text-emerald-400",
                                                        isAnswered && isWrongSelection && "text-rose-600 dark:text-rose-400",
                                                        !isAnswered && "text-gray-500 dark:text-gray-400"
                                                    )}>
                                                        {String.fromCharCode(65 + oIdx)}.
                                                    </span>
                                                    <span className={cn(
                                                        "text-sm",
                                                        isAnswered && isCorrectOption && "text-emerald-700 dark:text-emerald-300",
                                                        isAnswered && isWrongSelection && "text-rose-700 dark:text-rose-300",
                                                        !isAnswered && "text-gray-700 dark:text-gray-300"
                                                    )}>
                                                        {option}
                                                    </span>
                                                </div>
                                                {isAnswered && isCorrectOption && (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                )}
                                                {isAnswered && isWrongSelection && (
                                                    <XCircle className="w-4 h-4 text-rose-500" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Explanation */}
                            <AnimatePresence>
                                {isAnswered && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="pl-9"
                                    >
                                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {q.explanation}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            {lockedQuestions.size > 0 && lockedQuestions.size < data.questions.length && (
                <div className="pt-6 text-center">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        {data.questions.length - lockedQuestions.size} question{data.questions.length - lockedQuestions.size > 1 ? 's' : ''} remaining
                    </p>
                </div>
            )}
        </div>
    );
}