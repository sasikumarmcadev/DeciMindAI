import React from 'react';
import { CodeBlock } from '@/components/code-block';

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        const codeBlockMatch = part.match(/```(\w+)?\n?([\s\S]*?)```/s);
        
        if (codeBlockMatch) {
          const [, language, code] = codeBlockMatch;
          return <CodeBlock key={index} language={language || 'text'} code={code.trim()} />;
        }
        
        // Don't render empty strings
        if (!part.trim()) return null;

        return (
          <p key={index} className="whitespace-pre-wrap leading-relaxed">
            {part}
          </p>
        );
      })}
    </div>
  );
}
