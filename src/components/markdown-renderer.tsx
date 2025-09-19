import React from 'react';
import { CodeBlock } from '@/components/ui/code-block';
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

  if (htmlBlock || cssBlock) {
    let modifiedContent = content;
    if (htmlBlock) modifiedContent = modifiedContent.replace(htmlBlock.block, '');
    if (cssBlock) modifiedContent = modifiedContent.replace(cssBlock.block, '');

    const parts = modifiedContent.split('\n').filter(p => p.trim());

    return (
      <div className="space-y-4">
        <CodePreview
          htmlCode={htmlBlock?.code}
          cssCode={cssBlock?.code}
        />
        {parts.map((p, i) => (
          <p key={i} className="whitespace-pre-wrap leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    );
  }

  // Fallback to original rendering if no html/css blocks are found
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        const codeBlockMatch = part.match(/```(\w+)?\n?([\s\S]*?)```/s);
        
        if (codeBlockMatch) {
          const [, language, code] = codeBlockMatch;
          return <CodeBlock key={index} language={language || 'text'} code={code.trim()} />;
        }
        
        if (!part.trim()) return null;

        const paragraphParts = part.split('\n').filter(p => p.trim());
        return paragraphParts.map((p, i) => (
          <p key={`${index}-${i}`} className="whitespace-pre-wrap leading-relaxed">
            {p}
          </p>
        ));
      })}
    </div>
  );
}