'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Bot, User, Trash2, Loader2, MessageSquare, Settings, Plus, LogOut, LogIn, Sun, Moon, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getDeciMindResponse } from '@/app/actions';
import { useTypewriter } from '@/hooks/use-typewriter';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { 
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/blocks/sidebar"
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
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { VerticalCutReveal } from '@/components/ui/vertical-cut-reveal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from '@/components/blocks/sidebar';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

function AssistantMessage({ content }: { content: string }) {
  const displayedContent = useTypewriter(content, 20);
  return <MarkdownRenderer content={displayedContent} />;
}

export const Logo = () => {
  return (
    <div
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
    </div>
  );
};


function WelcomeAnimation() {
  return (
    <div className="w-full h-full text-center flex flex-col items-center justify-center font-sans p-4 md:p-6 text-primary">
      <VerticalCutReveal
        splitBy="lines"
        staggerDuration={0.1}
        staggerFrom="first"
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
        }}
        containerClassName="text-xl md:text-2xl lg:text-3xl leading-tight"
      >
        {"Welcome to DeciMind"}
      </VerticalCutReveal>
      <VerticalCutReveal
        splitBy="words"
        staggerDuration={0.05}
        staggerFrom="first"
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
          delay: 0.7,
        }}
        containerClassName="mt-4 text-sm md:text-base lg:text-lg text-foreground/80 max-w-2xl"
      >
        {"I'm your advanced AI assistant, ready to help with questions, creative tasks, and more. How can I assist you today?"}
      </VerticalCutReveal>
    </div>
  );
}

function MenuItems() {
  const { isOpen } = useSidebar();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const handleNewChat = () => {
    // Implement new chat functionality
    console.log("New Chat");
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

  const links = [
    {
      title: "New Chat",
      onClick: () => handleNewChat(),
      icon: Plus,
    },
    {
      title: "Chat",
      href: "#",
      icon: MessageSquare,
    },
  ];

  return (
    <>
      {links.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton onClick={item.onClick} asChild={!item.onClick} tooltip={item.title}>
            {item.href ? (
              <a href={item.href}>
                <item.icon />
                {isOpen && <span>{item.title}</span>}
              </a>
            ) : (
              <>
                <item.icon />
                {isOpen && <span>{item.title}</span>}
              </>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
      <SidebarMenuItem>
        <Dialog>
          <DialogTrigger asChild>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              {isOpen && <span>Settings</span>}
            </SidebarMenuButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Manage your application settings.
              </DialogDescription>
            </DialogHeader>
            <SettingsDialogContent />
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
      <SidebarFooter>
        <SidebarGroup>
          {loading ? (
            <SidebarMenuButton className="w-full justify-start gap-3 h-12">
              <Loader2 className="h-5 w-5 animate-spin" />
              {isOpen && <span className="text-sm font-medium">Loading...</span>}
            </SidebarMenuButton>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-between gap-3 h-12">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isOpen && (
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{user.displayName}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    )}
                  </div>
                  {isOpen && <ChevronsUpDown className="h-5 w-5" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <SidebarMenuButton className="w-full justify-start gap-3 h-12" onClick={handleLogin}>
              <LogIn className="h-5 w-5" />
              {isOpen && <span className="text-sm font-medium">Login with Google</span>}
            </SidebarMenuButton>
          )}
        </SidebarGroup>
      </SidebarFooter>
    </>
  );
}

function SettingsDialogContent() {
  const { user } = useAuth();
  const { setTheme } = useTheme();

  return (
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
  )
}


export default function DeciMindPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

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

  return (
    <SidebarProvider>
      <div className={cn("rounded-md flex h-screen w-full flex-1 max-w-full mx-auto border-neutral-200 dark:border-neutral-700 overflow-hidden")}>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>
                <Logo />
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <MenuItems />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex flex-col flex-1 h-screen bg-background">
          <header className="flex items-center justify-between p-4 border-b shadow-sm bg-background">
            <SidebarTrigger className="h-5 w-5" />
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
              <WelcomeAnimation />
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
              className="bg-background border-border"
            />
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
}
