import React from 'react';
import { CodeBlock } from '@/components/ui/code-block';

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
