'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Bot, User, Send, Trash2, Loader2, MessageSquare, Settings, PanelLeft, Plus, LogOut, LogIn, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getGroqResponse } from '@/app/actions';
import { useTypewriter } from '@/hooks/use-typewriter';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger, SidebarFooter } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { signInWithGoogle, signOut } from '@/app/auth';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useTheme } from 'next-themes';


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
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { setTheme } = useTheme();


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

  const handleNewChat = () => {
    setMessages([]);
  };

  const handleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      console.error("Error signing in with Google:", error);
      if (error.includes('auth/popup-closed-by-user')) {
        return; // User closed the popup, so we don't show an error.
      }
      if (error.includes('auth/configuration-not-found')) {
        toast({
          title: 'Login Failed',
          description: 'Google Sign-In is not enabled for this project. Please enable it in the Firebase console.',
          variant: 'destructive',
        });
      } else if (error.includes('auth/unauthorized-domain')) {
        toast({
          title: 'Login Failed',
          description: 'This domain is not authorized for authentication. Please add it to the authorized domains in the Firebase console.',
          variant: 'destructive',
        });
      }
      else {
        toast({
          title: 'Login Failed',
          description: error,
          variant: 'destructive',
        });
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
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
              <SidebarMenuButton onClick={handleNewChat}>
                <Plus />
                New Chat
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>
                <MessageSquare />
                Chat
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Dialog>
                <DialogTrigger asChild>
                  <SidebarMenuButton disabled={!user}>
                    <Settings />
                    Settings
                  </SidebarMenuButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                      Manage your application settings.
                    </DialogDescription>
                  </DialogHeader>
                  {user && (
                    <div className="py-4 space-y-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={user.photoURL || undefined} />
                          <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-lg font-semibold">{user.displayName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-md font-medium">Theme</h3>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => setTheme('light')}>
                            <Sun className="h-5 w-5" />
                            <span className="sr-only">Light mode</span>
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => setTheme('dark')}>
                            <Moon className="h-5 w-5" />
                            <span className="sr-only">Dark mode</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {loading ? (
            <div className="flex items-center gap-2 p-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : user ? (
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.displayName}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button onClick={handleLogin} className="w-full">
              <LogIn />
              Login with Google
            </Button>
          )}
        </SidebarFooter>
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
                     <AvatarImage src={user?.photoURL || undefined} />
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
    </>
  );
}
