import React from 'react';
import { CodeBlock } from '@/components/code-block';
import { CodePreview } from '@/components/ui/code-preview';

type CodeBlockInfo = {
  lang: string;
  code: string;
  block: string;
};

function extractCodeBlocks(content: string): CodeBlockInfo[] {
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/gs;
  const blocks: CodeBlockInfo[] = [];
  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push({
      lang: match[1] || 'text',
      code: match[2].trim(),
      block: match[0],
    });
  }
  return blocks;
}

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const allCodeBlocks = extractCodeBlocks(content);
  const htmlBlock = allCodeBlocks.find(b => b.lang === 'html');
  const cssBlock = allCodeBlocks.find(b => b.lang === 'css');
  const jsBlock = allCodeBlocks.find(b => b.lang === 'javascript' || b.lang === 'js');

  const hasPreview = htmlBlock || cssBlock;

  // Fallback to original rendering if no html/css blocks are found
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <div className="space-y-4">
      {hasPreview && (
        <CodePreview
          htmlCode={htmlBlock?.code}
          cssCode={cssBlock?.code}
          jsCode={jsBlock?.code}
        />
      )}
      {parts.map((part, index) => {
        const codeBlockMatch = part.match(/```(\w+)?\n?([\s\S]*?)```/s);
        
        if (codeBlockMatch) {
          const [, language, code] = codeBlockMatch;
          if (hasPreview && (language === 'html' || language === 'css' || language === 'javascript' || language === 'js')) {
            return null;
          }
          return <CodeBlock key={index} language={language || 'text'} code={code.trim()} />;
        }
        
        if (!part.trim()) return null;

        const filteredPart = part.replace(/<preview>[\s\S]*?<\/preview>/g, '').trim();
        if (!filteredPart) return null;

        const paragraphParts = filteredPart.split('\n').filter(p => p.trim());
        return paragraphParts.map((p, i) => (
          <p key={`${index}-${i}`} className="whitespace-pre-wrap leading-relaxed">
            {p}
          </p>
        ));
      })}
    </div>
  );
}
