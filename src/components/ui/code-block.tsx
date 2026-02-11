"use client";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, ChevronDown, ChevronUp, Eye, Code2, Maximize2, Minimize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  language: string;
  code: string;
  filename?: string;
  highlightLines?: number[];
}

export const CodeBlock = ({
  language,
  code,
  filename,
  highlightLines,
  className,
  ...props
}: CodeBlockProps) => {
  const [isCopied, setIsCopied] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isPreview, setIsPreview] = React.useState(false);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const codeRef = React.useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    if (isCopied) return;
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };

  const totalLines = code.split("\n").length;
  const showCollapseButton = totalLines > 10;
  const canPreview = language === 'html' || language === 'css';

  const previewContent = language === 'css'
    ? `<html><head><style>${code}</style></head><body><div class="preview-text">CSS Preview (No HTML context)</div></body></html>`
    : code;

  // Full Screen Overlay
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center animate-in fade-in duration-200">
        <div className="w-full h-full max-w-7xl bg-[#0d1117] rounded-xl border border-neutral-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
              </div>
              <span className="text-sm font-medium text-neutral-400 ml-2 font-mono">
                {filename || "Preview"}
              </span>
            </div>
            <button
              onClick={() => setIsFullScreen(false)}
              className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-all duration-200"
              title="Close Fullscreen"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 w-full bg-[#0d1117] relative overflow-hidden flex flex-col">
            {isPreview ? (
              <div className="flex-1 w-full bg-white">
                <iframe
                  srcDoc={previewContent}
                  title="Full Screen Preview"
                  className="w-full h-full border-none"
                  sandbox="allow-scripts"
                />
              </div>
            ) : (
              <div className="flex-1 w-full overflow-auto custom-scrollbar">
                <SyntaxHighlighter
                  language={language}
                  style={vscDarkPlus}
                  showLineNumbers
                  wrapLines
                  customStyle={{
                    margin: 0,
                    padding: "1.5rem",
                    backgroundColor: "#0d1117",
                    width: "100%",
                    height: "100%",
                  }}
                  codeTagProps={{
                    style: {
                      fontFamily: "inherit",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    },
                  }}
                  lineNumberStyle={{
                    minWidth: "2.25em",
                    paddingRight: "1em",
                    textAlign: "right",
                    userSelect: "none",
                    color: "#4b5563",
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-[#0d1117] text-sm rounded-xl border border-gray-200 dark:border-neutral-800 w-full overflow-hidden font-mono my-4",
        className
      )}
      {...props}
      ref={codeRef}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-neutral-800">
        <div className="flex items-center gap-3">
          {canPreview && (
            <div className="flex bg-neutral-800/50 rounded-lg p-0.5 border border-neutral-700/50">
              <button
                onClick={() => setIsPreview(false)}
                className={cn(
                  "p-1.5 rounded-md transition-all duration-200",
                  !isPreview ? "bg-neutral-700 text-white shadow-sm" : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                )}
                title="Code View"
              >
                <Code2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsPreview(true)}
                className={cn(
                  "p-1.5 rounded-md transition-all duration-200",
                  isPreview ? "bg-neutral-700 text-white shadow-sm" : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                )}
                title="Preview View"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          )}
          <span className="text-neutral-400 text-xs font-medium px-2">{filename || language}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullScreen(true)}
            className="text-neutral-400 hover:text-white transition-colors p-1.5 rounded hover:bg-neutral-800"
            title="Full Screen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {showCollapseButton && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-neutral-400 hover:text-white transition-colors p-1.5 rounded hover:bg-neutral-800"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors py-1.5 px-3 rounded-md hover:bg-neutral-800 border border-transparent hover:border-neutral-700"
            disabled={isCopied}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isCopied ? (
                <motion.div
                  key="check"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-green-400 font-medium">Copied</span>
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {isPreview ? (
              <div className="w-full h-80 bg-white">
                <iframe
                  srcDoc={previewContent}
                  title="Preview"
                  className="w-full h-full border-none"
                  sandbox="allow-scripts"
                />
              </div>
            ) : (
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                showLineNumbers
                wrapLines
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                  backgroundColor: "#0d1117",
                  width: "100%",
                  overflowX: "auto",
                }}
                codeTagProps={{
                  style: {
                    fontFamily: "inherit",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  },
                }}
                lineNumberStyle={{
                  minWidth: "2.25em",
                  paddingRight: "1em",
                  textAlign: "right",
                  userSelect: "none",
                  color: "#4b5563",
                }}
                lineProps={(lineNumber) => {
                  const isHighlighted = highlightLines?.includes(lineNumber);
                  return {
                    style: {
                      display: "block",
                      width: "fit-content",
                      minWidth: "100%",
                      backgroundColor: isHighlighted ? "#ffffff0f" : "transparent",
                    },
                  };
                }}
              >
                {code}
              </SyntaxHighlighter>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
