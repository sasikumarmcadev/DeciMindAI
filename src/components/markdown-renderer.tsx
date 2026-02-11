import React from 'react';
import { CodeBlock } from '@/components/ui/code-block';
import { CodeCard } from '@/components/ui/code-card';
import { cn } from '@/lib/utils';

// Types for our simple AST
type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'ul' | 'ol' | 'blockquote' | 'code' | 'table';
interface Block {
    type: BlockType;
    content: string[]; // Lines of content
    language?: string; // For code blocks
}

function parseMarkdown(text: string): Block[] {
    const blocks: Block[] = [];
    const lines = text.split('\n');
    let currentBlock: Block | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Code Blocks
        if (line.trim().startsWith('```')) {
            if (currentBlock && currentBlock.type === 'code') {
                // End of code block
                blocks.push(currentBlock);
                currentBlock = null;
            } else {
                // Start of code block
                if (currentBlock) blocks.push(currentBlock);
                const language = line.trim().substring(3).trim();
                currentBlock = { type: 'code', content: [], language };
            }
            continue;
        }

        if (currentBlock && currentBlock.type === 'code') {
            currentBlock.content.push(line);
            continue;
        }

        // If currentBlock is a table and the current line is not a table line, end the table.
        // However, we must be careful not to break table if it's just an empty line inside (though typically md tables don't have empty lines).
        if (currentBlock && currentBlock.type === 'table' && !trimmedLine.startsWith('|')) {
            blocks.push(currentBlock);
            currentBlock = null;
        }

        // Tables
        if (trimmedLine.startsWith('|')) {
            if (currentBlock && currentBlock.type === 'table') {
                currentBlock.content.push(trimmedLine);
            } else {
                if (currentBlock) blocks.push(currentBlock);
                currentBlock = { type: 'table', content: [trimmedLine] };
            }
            continue;
        }

        // Headers
        if (trimmedLine.startsWith('#')) {
            if (currentBlock) blocks.push(currentBlock);
            const level = trimmedLine.match(/^#+/)?.[0].length || 1;
            const type = `h${Math.min(level, 6)}` as BlockType;
            const content = trimmedLine.replace(/^#+\s*/, '');
            currentBlock = { type, content: [content] };
            blocks.push(currentBlock);
            currentBlock = null;
            continue;
        }

        // Lists
        const isUl = trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ');
        const isOl = /^\d+\.\s/.test(trimmedLine);

        if (isUl || isOl) {
            const type = isUl ? 'ul' : 'ol';
            const content = trimmedLine.replace(/^[-*]\s|^\d+\.\s/, '');

            if (currentBlock && currentBlock.type === type) {
                currentBlock.content.push(content);
            } else {
                if (currentBlock) blocks.push(currentBlock);
                currentBlock = { type, content: [content] };
            }
            continue;
        }

        // Blockquotes
        if (trimmedLine.startsWith('> ')) {
            const content = trimmedLine.replace(/^>\s*/, '');
            if (currentBlock && currentBlock.type === 'blockquote') {
                currentBlock.content.push(content);
            } else {
                if (currentBlock) blocks.push(currentBlock);
                currentBlock = { type: 'blockquote', content: [content] };
            }
            continue;
        }

        // Empty lines (separator)
        if (!trimmedLine) {
            if (currentBlock) {
                blocks.push(currentBlock);
                currentBlock = null;
            }
            continue;
        }

        // Paragraphs
        if (currentBlock && currentBlock.type === 'paragraph') {
            currentBlock.content.push(line);
        } else {
            if (currentBlock) blocks.push(currentBlock);
            currentBlock = { type: 'paragraph', content: [line] };
        }
    }

    if (currentBlock) {
        blocks.push(currentBlock);
    }

    return blocks;
}

// Inline formatting parser
function renderInline(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];

    // Split by code `...`
    const codeParts = text.split(/(`[^`]+`)/g);

    codeParts.forEach((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
            parts.push(<code key={`code-${i}`} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary/80">{part.slice(1, -1)}</code>);
            return;
        }

        // Within non-code text, process Bold **...**
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        boldParts.forEach((bPart, j) => {
            if (bPart.startsWith('**') && bPart.endsWith('**')) {
                parts.push(<strong key={`bold-${i}-${j}`} className="font-bold text-foreground">{bPart.slice(2, -2)}</strong>);
                return;
            }

            // Process Italic *...*
            const italicParts = bPart.split(/(\*[^*]+\*)/g);
            italicParts.forEach((iPart, k) => {
                // Check if it's a valid italic pair
                if (iPart.startsWith('*') && iPart.endsWith('*') && iPart.length > 2) {
                    parts.push(<em key={`italic-${i}-${j}-${k}`} className="italic text-foreground/90">{iPart.slice(1, -1)}</em>);
                    return;
                }

                // Process Links [text](url) or <url>
                const linkRegex = /\[([^\]]+)\]\(([^)]+)\)|<(https?:\/\/[^>]+)>/g;
                let lastIndex = 0;
                let match;

                if (!linkRegex.test(iPart)) {
                    parts.push(<React.Fragment key={`text-${i}-${j}-${k}`}>{iPart}</React.Fragment>);
                    return;
                }

                linkRegex.lastIndex = 0;
                while ((match = linkRegex.exec(iPart)) !== null) {
                    const before = iPart.substring(lastIndex, match.index);
                    if (before) parts.push(<span key={`text-${i}-${j}-${k}-${lastIndex}`}>{before}</span>);

                    const isMarkdownLink = !!match[1];
                    const text = isMarkdownLink ? match[1] : match[3];
                    const url = isMarkdownLink ? match[2] : match[3];

                    parts.push(
                        <a
                            key={`link-${i}-${j}-${k}-${match.index}`}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors break-words inline-flex items-center gap-1"
                        >
                            {text}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </a>
                    );

                    lastIndex = match.index + match[0].length;
                }
                const after = iPart.substring(lastIndex);
                if (after) parts.push(<span key={`text-${i}-${j}-${k}-end`}>{after}</span>);
            });
        });
    });

    return parts;
}

export function MarkdownRenderer({
    content,
    onViewCode
}: {
    content: string;
    onViewCode?: (code: string, language: string) => void;
}) {
    if (!content) return null;

    // 1. Normalizing newlines
    const normalized = content.replace(/\r\n/g, '\n');
    const blocks = parseMarkdown(normalized);

    return (
        <div className="space-y-6 text-foreground/90 leading-7 text-base md:text-[1.05rem] tracking-wide max-w-none">
            {blocks.map((block, index) => {
                const key = `block-${index}`;

                switch (block.type) {
                    case 'code':
                        const codeContent = block.content.join('\n');
                        const language = block.language || 'text';

                        if (onViewCode) {
                            return (
                                <CodeCard
                                    key={key}
                                    language={language}
                                    code={codeContent}
                                    filename={language}
                                    onClick={() => onViewCode(codeContent, language)}
                                />
                            );
                        }

                        return (
                            <CodeBlock
                                key={key}
                                language={language}
                                code={codeContent}
                            />
                        );
                    case 'h1':
                        return <h1 key={key} className="text-3xl font-bold mt-6 mb-4 text-foreground border-b pb-2">{renderInline(block.content[0])}</h1>;
                    case 'h2':
                        return <h2 key={key} className="text-2xl font-bold mt-5 mb-3 text-foreground">{renderInline(block.content[0])}</h2>;
                    case 'h3':
                        return <h3 key={key} className="text-xl font-semibold mt-4 mb-2 text-foreground">{renderInline(block.content[0])}</h3>;
                    case 'h4':
                        return <h4 key={key} className="text-lg font-semibold mt-3 mb-2 text-foreground">{renderInline(block.content[0])}</h4>;
                    case 'blockquote':
                        return (
                            <blockquote key={key} className="border-l-4 border-primary/40 pl-4 py-1 my-4 italic text-muted-foreground bg-muted/20 rounded-r-md">
                                {block.content.map((line, i) => (
                                    <div key={i}>{renderInline(line)}</div>
                                ))}
                            </blockquote>
                        );
                    case 'table': {
                        const headerRow = block.content[0];
                        const separatorRow = block.content[1];
                        const bodyRows = block.content.slice(2);

                        // Basic validation
                        if (!headerRow || !separatorRow || !separatorRow.includes('---')) {
                            return (
                                <div key={key} className="my-2">
                                    {block.content.map((line, i) => (
                                        <p key={`${key}-${i}`}>{line}</p>
                                    ))}
                                </div>
                            );
                        }

                        const parseRow = (row: string) => row.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
                        const headers = parseRow(headerRow);

                        return (
                            <div key={key} className="my-6 w-full overflow-x-auto rounded-lg border border-border/50 shadow-sm bg-card/50">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground border-b border-border/50 font-medium">
                                        <tr>
                                            {headers.map((header, i) => (
                                                <th key={i} className="px-4 py-3 align-middle font-medium text-foreground">
                                                    {renderInline(header)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {bodyRows.map((row, i) => {
                                            const cells = parseRow(row);
                                            return (
                                                <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                    {cells.map((cell, j) => (
                                                        <td key={j} className="px-4 py-3 align-top text-foreground/90">
                                                            {renderInline(cell)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        );
                    }
                    case 'ul':
                        return (
                            <ul key={key} className="list-disc list-outside ml-6 space-y-1 my-2 marker:text-muted-foreground">
                                {block.content.map((item, i) => (
                                    <li key={i} className="pl-1">{renderInline(item)}</li>
                                ))}
                            </ul>
                        );
                    case 'ol':
                        return (
                            <ol key={key} className="list-decimal list-outside ml-6 space-y-1 my-2 marker:text-muted-foreground">
                                {block.content.map((item, i) => (
                                    <li key={i} className="pl-1">{renderInline(item)}</li>
                                ))}
                            </ol>
                        );
                    default:
                        return (
                            <div key={key} className="my-3 whitespace-pre-wrap text-justify">
                                {block.content.map((line, i) => (
                                    <React.Fragment key={i}>
                                        {renderInline(line)}
                                        {i < block.content.length - 1 && <br />}
                                    </React.Fragment>
                                ))}
                            </div>
                        );
                }
            })}
        </div>
    );
}
