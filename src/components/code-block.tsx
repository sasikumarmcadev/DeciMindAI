'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy code to clipboard.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="relative font-code text-sm rounded-lg bg-slate-900 text-slate-50 dark:bg-slate-800 dark:text-slate-50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
        <span className="text-xs font-semibold text-slate-400 capitalize">
          {language}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-400 hover:bg-slate-700 hover:text-white"
          onClick={handleCopy}
        >
          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}
