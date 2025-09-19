"use client";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
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

  return (
    <div
      className={cn(
        "bg-[#0d1117] text-sm rounded-xl border border-neutral-800 w-full overflow-hidden font-mono",
        className
      )}
      {...props}
      ref={codeRef}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/50 border-b border-neutral-800">
        <span className="text-neutral-400 text-xs">{filename || language}</span>
        <div className="flex items-center gap-2">
          {showCollapseButton && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isExpanded ? "Collapse" : "Expand"}
              </span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="text-neutral-400 hover:text-white transition-colors"
            disabled={isCopied}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isCopied ? "check" : "copy"}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </motion.div>
            </AnimatePresence>
            <span className="sr-only">Copy code</span>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
