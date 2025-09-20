

'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Bot, User, Trash2, Loader2, MessageSquare, Settings, Plus, LogOut, LogIn, Sun, Moon, ChevronsUpDown, ChevronsLeft, ChevronsRight, Copy, ThumbsUp, ThumbsDown, Lightbulb, Code, Pen, FolderCode } from 'lucide-react';
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
import { ref, onValue, off, push, serverTimestamp, remove, set, update } from 'firebase/database';
import Orb from '@/components/ui/Orb';


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
  const displayedContent = useTypewriter(content, 5);
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

const SuggestionCard = ({ icon, text, onClick }: { icon: React.ReactNode, text: string, onClick: () => void }) => (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-border/20 cursor-pointer hover:bg-accent/20 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-primary">
            {icon}
        </div>
        <p className="text-sm text-left text-foreground">{text}</p>
      </div>
    </motion.div>
  );

function WelcomeAnimation({ onSuggestionClick }: { onSuggestionClick: (suggestion: string) => void }) {
  const suggestions = [
    { icon: <Lightbulb className="w-5 h-5" />, text: "Explain quantum computing in simple terms" },
    { icon: <Code className="w-5 h-5" />, text: "Write a python script to sort a list" },
    { icon: <Pen className="w-5 h-5" />, text: "Draft an email to a new client" },
    { icon: <Bot className="w-5 h-5" />, text: "Tell me a fun fact about the universe" },
  ];
  return (
    <div className="w-full h-full text-center flex flex-col items-center justify-center font-sans p-4 md:p-6 text-primary relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
            <div style={{ width: '100%', height: '400px', position: 'relative' }}>
                <Orb
                    hoverIntensity={0.5}
                    rotateOnHover={true}
                    hue={0}
                    forceHoverState={false}
                />
            </div>
        </div>
        <div className="z-10 flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-bold max-w-2xl mb-4">
                <VerticalCutReveal>Hello, how can I help you today?</VerticalCutReveal>
            </h1>
            <p className="text-foreground/70 max-w-lg mb-8">
                I can help you with a variety of tasks. Here are some suggestions to get started:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-xl w-full">
                {suggestions.map((s, i) => (
                    <SuggestionCard key={i} icon={s.icon} text={s.text} onClick={() => onSuggestionClick(s.text)} />
                ))}
            </div>
        </div>
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
      const unsubscribe = onValue(chatsRef, (snapshot) => {
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

      return () => unsubscribe();
    } else {
      setChats([]);
    }
  }, [user]);

  const handleNewChat = async () => {
    if (user) {
      const chatsRef = ref(database, `chats/${user.uid}`);
      const newChatRef = push(chatsRef);
      const newChatId = newChatRef.key;

      if (newChatId) {
        const newChatData = {
          createdAt: serverTimestamp(),
          title: 'New Chat',
        };
        
        await set(newChatRef, newChatData);
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
  const router = useRouter();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<{ [key: string]: 'like' | 'dislike' | null }>({});

  const handleFeedback = (messageId: string, newFeedback: 'like' | 'dislike') => {
    if (user && !chatId.startsWith('guest_')) {
        const feedbackRef = ref(database, `chats/${user.uid}/${chatId}/messages/${messageId}/feedback`);
        const currentFeedback = feedback[messageId];

        if (currentFeedback === newFeedback) {
            // User clicks the same button again, remove feedback
            remove(feedbackRef);
            setFeedback(prev => ({...prev, [messageId]: null}));
        } else {
            // Set new feedback
            set(feedbackRef, newFeedback);
            setFeedback(prev => ({...prev, [messageId]: newFeedback}));
        }
    } else {
        toast({
            title: 'Login to save feedback',
            description: 'Please log in to make your feedback count!',
            variant: 'default',
        });
    }
  };


  useEffect(() => {
    if (loading) return;

    if (user && chatId.startsWith('guest_')) {
      router.push('/');
      return;
    }

    let dbRef;
    if (user && !chatId.startsWith('guest_')) {
      dbRef = ref(database, `chats/${user.uid}/${chatId}/messages`);
    } else {
      setMessages([]);
    }

    if (dbRef) {
      const unsubscribe = onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const msgs: Message[] = [];
            const newFeedback: { [key: string]: 'like' | 'dislike' } = {};
            Object.entries(data).forEach(([id, msgData]: [string, any]) => {
                msgs.push({ id, ...msgData });
                if (msgData.feedback) {
                    newFeedback[id] = msgData.feedback;
                }
            });
            setMessages(msgs);
            setFeedback(newFeedback);
        } else {
            setMessages([]);
            setFeedback({});
        }
      }, (error) => {
        console.error(error);
        setMessages([]);
      });

      return () => unsubscribe();
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
    
    const isNewChat = messages.length === 0;
  
    if (user && !chatId.startsWith('guest_')) {
      const messagesRef = ref(database, `chats/${user.uid}/${chatId}/messages`);
      push(messagesRef, userMessage);
    } else {
      setMessages(prev => [...prev, userMessage]);
    }
  
    startTransition(async () => {
      const currentHistory = messages.map(({role, content}) => ({role, content}));
      const result = await getDeciMindResponse(currentHistory, message);
      
      let responseContent = 'Sorry, something went wrong.';
      if (result.response) {
        responseContent = result.response;
      } else if (result.error) {
        responseContent = result.error;
      }
      
      const assistantMessage: Message = { role: 'assistant', content: responseContent };

      if (user && !chatId.startsWith('guest_')) {
        const messagesRef = ref(database, `chats/${user.uid}/${chatId}/messages`);
        push(messagesRef, assistantMessage);
        
        if (isNewChat && result.title) {
          const chatRef = ref(database, `chats/${user.uid}/${chatId}`);
          update(chatRef, { title: result.title });
        }
      } else {
        setMessages(prev => [...prev, userMessage, assistantMessage]);
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
                <WelcomeAnimation onSuggestionClick={handleSendMessage} />
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
                  className={`max-w-lg md:max-w-xl lg:max-w-2xl group`}
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
                    <div className="flex items-center justify-end px-2 pt-2 gap-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(msg.content)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn("h-7 w-7", feedback[msg.id] === 'like' && 'text-primary bg-accent')}
                        onClick={() => handleFeedback(msg.id, 'like')}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn("h-7 w-7", feedback[msg.id] === 'dislike' && 'text-destructive bg-destructive/10')}
                        onClick={() => handleFeedback(msg.id, 'dislike')}
                      >
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
                <div className="max-w-xl w-full rounded-xl p-4 shadow-sm bg-card border flex items-center justify-center min-h-[60px]">
                    <div className="pulsing-loader" />
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
  const { chatId } = params;
  return (
    <SidebarProvider>
      <PageContent chatId={chatId} />
    </SidebarProvider>
  );
}

    
