'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Bot, User, Send, Trash2, Loader2, MessageSquare, Settings, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getGroqResponse } from '@/app/actions';
import { useTypewriter } from '@/hooks/use-typewriter';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

function AssistantMessage({ content }: { content: string }) {
  const displayedContent = useTypewriter(content, 20);
  return <MarkdownRenderer content={displayedContent} />;
}

export default function GroqChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    const userInput = input;
    setInput('');

    startTransition(async () => {
      const chatHistory = newMessages.filter(m => m.role !== 'user' || m.content !== userInput);
      const result = await getGroqResponse(chatHistory, userInput);

      if (result.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: result.error || 'Sorry, something went wrong.' },
        ]);
      }
    });
  };
  
  const handleClear = () => {
    setMessages([]);
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold font-headline">Groq Chat</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>
                <MessageSquare />
                Chat
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <header className="flex items-center justify-between p-4 border-b shadow-sm">
            <SidebarTrigger>
              <PanelLeft />
            </SidebarTrigger>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-headline">Groq Chat</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClear} aria-label="Clear Conversation">
              <Trash2 className="h-5 w-5" />
            </Button>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback>
                      <Bot className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xl w-full rounded-xl p-4 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <AssistantMessage content={msg.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback>
                      <User className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isPending && (
                <div className="flex items-start gap-4 justify-start">
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback>
                      <Bot className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-xl w-full rounded-xl p-4 shadow-sm bg-card border">
                    <div className="bouncing-loader">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </div>
                </div>
              )}
            <div ref={messagesEndRef} />
          </main>

          <footer className="p-4 border-t bg-background">
            <Card className="max-w-3xl mx-auto">
              <CardContent className="p-2">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Message Groq Chat..."
                    className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0"
                    rows={1}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        handleSendMessage(e);
                      }
                    }}
                    disabled={isPending}
                  />
                  <Button type="submit" size="icon" disabled={!input.trim() || isPending}>
                    {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                     <span className="sr-only">Send Message</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </footer>
        </div>
      </SidebarInset>
    </div>
  );
}