
"use client";

import React, { useState } from 'react';
import { CodeBlock } from '@/components/ui/code-block';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Code, FolderCode, Expand } from 'lucide-react';

interface CodePreviewProps {
  htmlCode?: string;
  cssCode?: string;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ htmlCode = '', cssCode = '' }) => {
  const [activeTab, setActiveTab] = useState('preview');

  const combinedCode = `
    <html>
      <head>
        <style>
          body { margin: 0; padding: 1rem; font-family: sans-serif; background-color: #fff; }
          ${cssCode}
        </style>
      </head>
      <body>
        ${htmlCode}
      </body>
    </html>
  `;
  
  const hasHtml = htmlCode.trim() !== '';
  const hasCss = cssCode.trim() !== '';

  return (
    <div className="w-full my-6 rounded-xl border overflow-hidden bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between pr-2 bg-muted border-b">
          <TabsList className="bg-transparent p-0 border-none">
            <TabsTrigger value="preview" className="gap-2 h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </TabsTrigger>
            {hasHtml && (
              <TabsTrigger value="html" className="gap-2 h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                <Code className="h-4 w-4" />
                <span>HTML</span>
              </TabsTrigger>
            )}
            {hasCss && (
              <TabsTrigger value="css" className="gap-2 h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                <FolderCode className="h-4 w-4" />
                <span>CSS</span>
              </TabsTrigger>
            )}
          </TabsList>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Expand className="h-4 w-4" />
                <span className="sr-only">Open preview in new window</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] h-[90vh] p-0 border-0">
              <iframe
                srcDoc={combinedCode}
                title="Code Preview"
                sandbox="allow-scripts"
                frameBorder="0"
                className="w-full h-full bg-white rounded-lg"
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <TabsContent value="preview" className="m-0">
          <iframe
            srcDoc={combinedCode}
            title="Code Preview"
            sandbox="allow-scripts"
            frameBorder="0"
            className="w-full h-64 md:h-80 lg:h-96 bg-white"
          />
        </TabsContent>
        {hasHtml && (
          <TabsContent value="html" className="m-0">
            <CodeBlock language="html" code={htmlCode} className="rounded-none border-0" />
          </TabsContent>
        )}
        {hasCss && (
          <TabsContent value="css" className="m-0">
            <CodeBlock language="css" code={cssCode} className="rounded-none border-0" />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
