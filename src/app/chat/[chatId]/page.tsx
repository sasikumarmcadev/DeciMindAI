

'use client';

import { useState, useRef, useEffect, useTransition, use } from 'react';
import { Bot, User, Trash2, Loader2, MessageSquare, Settings, Plus, LogOut, LogIn, Sun, Moon, ChevronsUpDown, ChevronsLeft, ChevronsRight, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
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
  useSidebar,
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
import { cn } from '@/lib/utils';
import { VerticalCutReveal } from '@/components/ui/vertical-cut-reveal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase';
import { ref, onValue, off, push, serverTimestamp, remove, set } from 'firebase/database';


type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Chat = {
  id: string;
  title: string;
  createdAt: number;
}

function AssistantMessage({ content }: { content: string }) {
  const displayedContent = useTypewriter(content, 20);
  return <MarkdownRenderer content={displayedContent} />;
}

export const Logo = ({ isOpen }: { isOpen?: boolean }) => {
  return (
    <div
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      {isOpen && <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        DeciMind
      </motion.span>}
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

function SidebarItems() {
  const { isOpen } = useSidebar();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (user) {
      const chatsRef = ref(database, `chats/${user.uid}`);
      onValue(chatsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const chatList = Object.entries(data).map(([id, chat]: [string, any]) => ({
            id,
            ...chat,
          }));
          chatList.sort((a, b) => b.createdAt - a.createdAt);
          setChats(chatList);
        } else {
          setChats([]);
        }
      });

      return () => {
        off(chatsRef);
      };
    }
  }, [user]);

  const handleNewChat = async () => {
    if (user) {
      const chatsRef = ref(database, `chats/${user.uid}`);
      const newChatRef = push(chatsRef);
      const newChatId = newChatRef.key;

      const newChatData = {
        createdAt: serverTimestamp(),
        title: 'New Chat',
      };

      await set(newChatRef, newChatData);
      if (newChatId) {
        router.push(`/chat/${newChatId}`);
      }
    } else {
      const newChatId = `guest_${new Date().getTime()}`;
      router.push(`/chat/${newChatId}`);
    }
  };

  const handleLogin = async () => {
    const { user, error } = await signInWithGoogle();
    if (error) {
      if (error === 'The sign-in process was canceled.') {
        return; 
      }
      console.error("Error signing in with Google:", error);
      toast({
        title: 'Login Failed',
        description: error,
        variant: 'destructive',
      });
    } else if (user) {
      toast({
        title: 'Login Successful',
        description: `Welcome, ${user.displayName}!`,
      });
    }
  };

  const handleLogout = async () => {
    const { success, error } = await signOut();
    if (success) {
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    } else if (error) {
      toast({
        title: 'Logout Failed',
        description: error,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>
          <Logo isOpen={isOpen} />
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleNewChat} tooltip="New Chat">
                <Plus />
                {isOpen && <span>New Chat</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>

            {chats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton
                  onClick={() => router.push(`/chat/${chat.id}`)}
                  tooltip={chat.title}
                  className="justify-between"
                >
                  {isOpen && <span className="truncate">{chat.title}</span>}
                  {!isOpen && <MessageSquare />}
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
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
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
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isOpen && (
                      <div className="flex flex-col items-start overflow-hidden">
                        <span className="text-sm font-medium truncate">{user.displayName}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                      </div>
                    )}
                  </div>
                  {isOpen && <ChevronsUpDown className="h-5 w-5 flex-shrink-0" />}
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

function PageContent({ chatId }: { chatId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isOpen } = useSidebar();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return;

    // If the user logs in while on a guest chat, redirect them to create a new chat
    if (user && chatId.startsWith('guest_')) {
      router.push('/');
      return;
    }

    let dbRef;
    if (user) {
      dbRef = ref(database, `chats/${user.uid}/${chatId}/messages`);
    } else {
      // For guest users, we don't fetch from DB, messages are in-memory.
      // This part could be adjusted if we want guests to have temporary DB storage.
    }

    if (dbRef) {
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        setMessages(data ? Object.values(data) : []);
      });

      return () => {
        off(dbRef);
      }
    }
  }, [chatId, user, loading, router]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [isMobile])

  const handleSendMessage = (message: string, files?: File[]) => {
    if (!message.trim() && (!files || files.length === 0)) return;
  
    const userMessage: Message = { role: 'user', content: message };
  
    // For guest users, just update local state
    if (chatId.startsWith('guest_')) {
      setMessages(prev => [...prev, userMessage]);
    } else if (user) {
      // For logged-in users, push to DB which will trigger onValue
      const messagesRef = ref(database, `chats/${user.uid}/${chatId}/messages`);
      push(messagesRef, userMessage);
    }
  
    startTransition(async () => {
      const chatHistory = messages;
      const result = await getDeciMindResponse(chatHistory, message);
      
      let responseContent = 'Sorry, something went wrong.';
      if (result.response) {
        responseContent = result.response;
      } else if (result.error) {
        responseContent = result.error;
      }
      
      const assistantMessage: Message = { role: 'assistant', content: responseContent };
      
      if (chatId.startsWith('guest_')) {
        setMessages(prev => [...prev, assistantMessage]);
      } else if (user) {
        const messagesRef = ref(database, `chats/${user.uid}/${chatId}/messages`);
        push(messagesRef, assistantMessage);
      }
    });
  };

  const handleClear = () => {
    if (user && chatId && !chatId.startsWith('guest_')) {
      const chatRef = ref(database, `chats/${user.uid}/${chatId}`);
      remove(chatRef).then(() => {
        router.push('/');
      });
    } else if (chatId.startsWith('guest_')) {
      setMessages([]);
      router.push('/');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied to clipboard!" });
    }).catch(err => {
      toast({ title: "Failed to copy", description: "Could not copy text.", variant: "destructive" });
    });
  };

  return (
    <div className={cn("rounded-md flex h-screen w-full flex-1 max-w-full mx-auto border-neutral-200 dark:border-neutral-700 overflow-hidden")}>
      <Sidebar className="hidden md:flex">
        <SidebarContent>
          <SidebarItems />
        </SidebarContent>
      </Sidebar>

      <main className="flex flex-col flex-1 h-screen bg-background">
        <header className="flex items-center justify-between p-2 md:p-4 border-b shadow-sm bg-background">
          {isMobile ? (
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ChevronsRight className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-60">
                <SidebarProvider initialState={true}>
                  <Sidebar className="flex w-full">
                    <SidebarContent>
                      <SidebarItems />
                    </SidebarContent>
                  </Sidebar>
                </SidebarProvider>
              </SheetContent>
            </Sheet>
          ) : (
            <SidebarTrigger className="h-10 w-10 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground" />
          )}
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold font-headline">DeciMind</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClear} aria-label="Clear Conversation">
            <Trash2 className="h-5 w-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            {messages.length === 0 && !isPending && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <WelcomeAnimation />
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 md:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'
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
                  className={`max-w-lg md:max-w-xl lg:max-w-2xl w-full group`}
                >
                  <div
                    className={`rounded-xl p-3 md:p-4 shadow-sm ${msg.role === 'user'
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
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-end px-2 pt-2 gap-2 text-muted-foreground">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(msg.content)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
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
          </div>
        </div>

        <footer className="p-2 md:p-4 bg-transparent w-full max-w-4xl mx-auto">
          <PromptInputBox
            onSend={handleSendMessage}
            isLoading={isPending}
            placeholder="Message DeciMind..."
            className="bg-background border-border"
          />
        </footer>
      </main>
    </div>
  )
}

export default function DeciMindPage({ params }: { params: { chatId: string } }) {
  const { chatId } = use(Promise.resolve(params));
  return (
    <SidebarProvider>
      <PageContent chatId={chatId} />
    </SidebarProvider>
  );
}

    
