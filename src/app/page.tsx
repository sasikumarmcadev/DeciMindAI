'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Bot, User, Trash2, Loader2, MessageSquare, Settings, PanelLeft, Plus, LogOut, LogIn, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getDeciMindResponse } from '@/app/actions';
import { useTypewriter } from '@/hooks/use-typewriter';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
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
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { Balancer } from 'react-wrap-balancer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatMode = 'chat' | 'web';

function AssistantMessage({ content }: { content: string }) {
  const displayedContent = useTypewriter(content, 20);
  return <MarkdownRenderer content={displayedContent} />;
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        DeciMind
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};


export default function DeciMindPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "New Chat",
      href: "#",
      icon: (
        <Plus className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onClick: () => handleNewChat(),
    },
    {
      label: "Chat",
      href: "#",
      icon: (
        <MessageSquare className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (message: string, files?: File[]) => {
    if (!message.trim() && (!files || files.length === 0)) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: message }];
    setMessages(newMessages);

    startTransition(async () => {
      const chatHistory = newMessages.filter(m => m.role !== 'user' || m.content !== message);
      const result = await getDeciMindResponse(chatHistory, message);

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
      if (error.includes('auth/popup-closed-by-user')) {
        return;
      }
      console.error("Error signing in with Google:", error);
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
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-full mx-auto border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => {
                if (link.label === "Settings") {
                  return (
                     <Dialog key={idx}>
                        <DialogTrigger asChild>
                           <button className="flex items-center justify-start gap-2 group/sidebar py-2">
                            {link.icon}
                            <motion.span
                              animate={{
                                display: open ? "inline-block" : "none",
                                opacity: open ? 1 : 0,
                              }}
                              className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                            >
                              {link.label}
                            </motion.span>
                           </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Settings</DialogTitle>
                            <DialogDescription>
                              Manage your application settings.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-6">
                            {user ? (
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
                            ) : (
                              <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                  <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                  <p className="text-lg font-semibold">Guest User</p>
                                </div>
                              </div>
                            )}
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
                        </DialogContent>
                      </Dialog>
                  )
                }
                return (
                  <SidebarLink key={idx} link={link} onClick={link.onClick} />
                )
              })}
            </div>
          </div>
           <div>
            {loading ? (
              <div className="flex items-center gap-2 p-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : user ? (
              <SidebarLink
                link={{
                  label: user.displayName || "User",
                  href: "#",
                  icon: (
                    <Image
                      src={user.photoURL || "https://assets.aceternity.com/manu.png"}
                      className="h-7 w-7 flex-shrink-0 rounded-full"
                      width={50}
                      height={50}
                      alt="Avatar"
                    />
                  ),
                }}
                action={<LogOut className="h-5 w-5 text-neutral-700 dark:text-neutral-200" onClick={handleLogout}/>}
              />
            ) : (
              <SidebarLink
                link={{
                  label: "Login with Google",
                  href: "#",
                  icon: (
                    <LogIn className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                  ),
                }}
                onClick={handleLogin}
              />
            )}
          </div>
        </SidebarBody>
      </Sidebar>
      
      <div className="flex flex-col flex-1 h-screen bg-background">
        <header className="flex items-center justify-between p-4 border-b shadow-sm bg-background">
          <div></div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-headline">DeciMind</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClear} aria-label="Clear Conversation">
            <Trash2 className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 && !isPending && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="h-16 w-16 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">DeciMind</h2>
            <p className="text-muted-foreground">
              <Balancer>
                Your friendly AI assistant. Start a conversation by typing a message below.
              </Balancer>
            </p>
          </div>
        )}
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

        <footer className="p-4 bg-transparent w-full max-w-3xl mx-auto">
          <PromptInputBox
            onSend={handleSendMessage}
            isLoading={isPending}
            placeholder="Message DeciMind..."
          />
        </footer>
      </div>
    </div>
  );
}
