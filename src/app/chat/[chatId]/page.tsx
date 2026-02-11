'use client';

import { useState, useRef, useEffect, useTransition, use, useCallback } from 'react';
import { Bot, User, Trash2, Loader2, MessageSquare, Settings, Plus, LogOut, LogIn, Sun, Moon, ChevronsUpDown, ChevronsLeft, ChevronsRight, Copy, Check, ThumbsUp, ThumbsDown, Lightbulb, Code, Pen, FolderCode, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getDeciMindResponse } from '@/app/actions';
import { useTypewriter } from '@/hooks/use-typewriter';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import Image from 'next/image';
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
import { Input } from '@/components/ui/input';
import { ThinkResponse } from '@/components/ui/think-response';


type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isThinkResponse?: boolean;
  shouldAnimate?: boolean;
};

type Chat = {
  id: string;
  title: string;
  createdAt: number;
}

import { BlinkingCursor } from '@/components/ui/blinking-cursor';
import { UserCard } from '@/components/ui/user-card';

function AssistantMessage({ content, onViewCode, isNewMessage = false }: { content: string, onViewCode?: (code: string, language: string) => void, isNewMessage?: boolean }) {
  const displayedContent = useTypewriter(content, 5);
  // Only show typing effect if it's a new message
  const finalContent = isNewMessage ? displayedContent : content;
  const isTyping = isNewMessage && displayedContent.length < content.length;

  return (
    <>
      <MarkdownRenderer content={finalContent} onViewCode={onViewCode} />
      {isTyping && <BlinkingCursor />}
    </>
  );
}

export const Logo = ({ isOpen }: { isOpen?: boolean }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
      </div>
    )
  }

  return (
    <div
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      {theme === 'light' ? (
        <Image
          src="https://res.cloudinary.com/dhw6yweku/image/upload/v1758440741/Gemini_Generated_Image_27zxt327zxt327zx-removebg-preview_evmvx3.png"
          alt="DeciMindAI Logo"
          width={32}
          height={32}
        />
      ) : (
        <Image
          src="https://res.cloudinary.com/dhw6yweku/image/upload/v1770712388/Gemini_Generated_Image_82yj7482yj7482yj-removebg-preview_hwhj3p.png"
          alt="DeciMindAI Logo"
          width={32}
          height={32}
        />
      )}
      {isOpen && <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        DeciMindAI
      </motion.span>}
    </div>
  );
};

function WelcomeAnimation() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full h-full text-center flex flex-col items-center justify-center font-sans p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center z-0">

      </div>
      <div className="z-10 flex flex-col items-center">
        {mounted ? (
          <Image
            src={theme === 'light'
              ? "https://res.cloudinary.com/dhw6yweku/image/upload/v1758440741/Gemini_Generated_Image_27zxt327zxt327zx-removebg-preview_evmvx3.png"
              : "https://res.cloudinary.com/dhw6yweku/image/upload/v1770712388/Gemini_Generated_Image_82yj7482yj7482yj-removebg-preview_hwhj3p.png"
            }
            alt="DeciMindAI Logo"
            width={72}
            height={72}
            className="mb-6"
          />
        ) : (
          <div className="w-[72px] h-[72px] rounded-full bg-muted animate-pulse mb-6" />
        )}
        <h1 className="text-2xl md:text-3xl font-bold max-w-2xl mb-4 text-foreground">
          <VerticalCutReveal>Hello, how can I help you today?</VerticalCutReveal>
        </h1>
        <p className="text-sm text-foreground/70 max-w-lg mb-8">
          <VerticalCutReveal>I can help you with a variety of tasks. You can start by typing a prompt below.</VerticalCutReveal>
        </p>
      </div>
    </div>
  );
}

function SidebarNavigation() {
  const { isOpen } = useSidebar();
  const { user } = useAuth();
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

  return (
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

          {isOpen && chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                onClick={() => router.push(`/chat/${chat.id}`)}
                tooltip={chat.title}
                className="justify-between"
              >
                <span className="truncate">{chat.title}</span>
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
  );
}

function SidebarUserFooter() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

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
    <SidebarFooter>
      <SidebarGroup>
        <UserCard
          user={user}
          loading={loading}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      </SidebarGroup>
    </SidebarFooter>
  );
}

function SettingsDialogContent() {
  const { user } = useAuth();
  const { setTheme } = useTheme();

  // Force dark mode always
  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

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
  const { theme } = useTheme();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<string>('text');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom smooth resize implementation
  const [panelWidth, setPanelWidth] = useState(40);
  const [isDragging, setIsDragging] = useState(false);
  const isResizingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return;

    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Use requestAnimationFrame for smooth 60fps updates
    animationFrameRef.current = requestAnimationFrame(() => {
      const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;

      // Clamp between 20% and 80%
      if (newWidth >= 20 && newWidth <= 80) {
        setPanelWidth(newWidth);
      }
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizingRef.current = false;
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    // Clean up animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // Clean up animation frame on unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleViewCode = (code: string, language: string) => {
    setActiveCode(code);
    setActiveLanguage(language);
  };

  const handleCloseCode = () => {
    setActiveCode(null);
  };

  const handleFeedback = (messageId: string, newFeedback: 'like' | 'dislike') => {
    if (user && !chatId.startsWith('guest_')) {
      const feedbackRef = ref(database, `chats/${user.uid}/${chatId}/messages/${messageId}/feedback`);
      const currentFeedback = feedback[messageId];

      if (currentFeedback === newFeedback) {
        // User clicks the same button again, remove feedback
        remove(feedbackRef);
        setFeedback(prev => ({ ...prev, [messageId]: null }));
      } else {
        // Set new feedback
        set(feedbackRef, newFeedback);
        setFeedback(prev => ({ ...prev, [messageId]: newFeedback }));
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
            msgs.push({ id, ...msgData, shouldAnimate: false });
            if (msgData.feedback) {
              newFeedback[id] = msgData.feedback;
            }
          });
          // Sort messages by ID to ensure chronological order and prevent "rewriting/shuffling" effect
          msgs.sort((a, b) => a.id.localeCompare(b.id));

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
  }, [messages, isPending]);

  useEffect(() => {
    if (!isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [isMobile])



  const handleSendMessage = (message: string, files?: File[]) => {
    if (!message.trim() && (!files || files.length === 0)) return;

    let fullMessage = message;
    if (files && files.length > 0) {
      const fileNames = files.map(f => f.name).join(', ');
      fullMessage = `${message}\n\n[Attached: ${fileNames}]`;
    }

    const userMessage: Message = { role: 'user', content: fullMessage, id: `local_${Date.now()}` };

    const isNewChat = messages.length === 0;

    if (user && !chatId.startsWith('guest_')) {
      const messagesRef = ref(database, `chats/${user.uid}/${chatId}/messages`);
      push(messagesRef, { role: 'user', content: fullMessage });

      // Set the chat title to the user's prompt if it's a new chat
      if (isNewChat) {
        const chatRef = ref(database, `chats/${user.uid}/${chatId}`);
        // Truncate to 100 characters to avoid excessively long titles
        const title = fullMessage.length > 100 ? fullMessage.substring(0, 100) + '...' : fullMessage;
        update(chatRef, { title });
      }
    } else {
      setMessages(prev => [...prev, userMessage]);
    }

    startTransition(async () => {
      const currentHistory = messages.map(({ role, content }) => ({ role, content }));

      let processedFiles;
      if (files && files.length > 0) {
        try {
          processedFiles = await Promise.all(files.map(async (file) => {
            return new Promise<{ name: string; type: string; content: string }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve({
                name: file.name,
                type: file.type || 'application/octet-stream',
                content: reader.result as string
              });
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          }));
        } catch (error) {
          console.error("Error processing files:", error);
          // Continue without files if processing fails, but ideally notify user
        }
      }

      const result = await getDeciMindResponse(currentHistory, fullMessage, processedFiles);

      let responseContent = 'Sorry, something went wrong.';
      if (result.response) {
        responseContent = result.response;
      } else if (result.error) {
        responseContent = result.error;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: responseContent,
        id: `local_${Date.now() + 1}`,
        isThinkResponse: result.isThinkResponse,
        shouldAnimate: true
      };

      if (user && !chatId.startsWith('guest_')) {
        const messagesRef = ref(database, `chats/${user.uid}/${chatId}/messages`);
        push(messagesRef, { role: 'assistant', content: responseContent, isThinkResponse: result.isThinkResponse });

        // Previous AI title generation logic removed/commented out above
      } else {
        setMessages(prev => [...prev, assistantMessage]);
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

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleEdit = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!user || chatId.startsWith('guest_') || !editingContent.trim()) {
      handleCancelEdit();
      return;
    }

    const messageRef = ref(database, `chats/${user.uid}/${chatId}/messages/${messageId}`);
    await update(messageRef, { content: editingContent });

    const editedMessageIndex = messages.findIndex(msg => msg.id === messageId);
    if (editedMessageIndex === -1) {
      handleCancelEdit();
      return;
    }

    // In guest mode, just update local state
    if (chatId.startsWith('guest_')) {
      const updatedMessages = messages.map(msg => msg.id === messageId ? { ...msg, content: editingContent } : msg);
      setMessages(updatedMessages.slice(0, editedMessageIndex + 1));
    } else {
      // Remove all subsequent messages in Firebase
      const subsequentMessages = messages.slice(editedMessageIndex + 1);
      for (const msg of subsequentMessages) {
        const msgRef = ref(database, `chats/${user.uid}/${chatId}/messages/${msg.id}`);
        await remove(msgRef);
      }
    }

    setEditingMessageId(null);
    setEditingContent('');

    startTransition(async () => {
      const currentHistory = messages.slice(0, editedMessageIndex + 1).map(({ role }, index) => ({
        role,
        content: index === editedMessageIndex ? editingContent : messages[index].content
      }));

      const result = await getDeciMindResponse(currentHistory, editingContent);

      let responseContent = 'Sorry, something went wrong.';
      if (result.response) {
        responseContent = result.response;
      } else if (result.error) {
        responseContent = result.error;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: responseContent,
        id: `local_${Date.now() + 1}`,
        isThinkResponse: result.isThinkResponse
      };

      if (user && !chatId.startsWith('guest_')) {
        const messagesRef = ref(database, `chats/${user.uid}/${chatId}/messages`);
        push(messagesRef, { role: 'assistant', content: responseContent, isThinkResponse: result.isThinkResponse });
      } else {
        setMessages(prev => [...prev, assistantMessage]);
      }
    });
  };

  const isEmpty = messages.length === 0 && !isPending;

  return (
    <div className={cn("rounded-md flex h-screen w-full flex-1 max-w-full mx-auto overflow-hidden")}>
      <Sidebar className="hidden lg:flex rounded-tr-[1.3rem] rounded-br-[1.3rem] border-r mr-2">
        <SidebarContent>
          <SidebarNavigation />
        </SidebarContent>
        <SidebarUserFooter />
      </Sidebar>

      {/* Main content area with custom resizable split */}
      <div className="flex flex-1 h-screen">
        {/* Main Chat Area */}
        <main
          className="flex flex-col flex-1 h-screen bg-background min-w-0"
          style={{
            width: activeCode && !isMobile ? `${100 - panelWidth}%` : '100%',
            transition: isResizingRef.current ? 'none' : 'width 0.2s ease-out'
          }}
        >
          <header className="flex items-center justify-between p-2 md:p-4 border-b shadow-sm bg-background">
            <div className="flex items-center gap-2">
              <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <ChevronsRight className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-60">
                  <SidebarProvider initialState={true}>
                    <Sidebar className="flex w-full">
                      <SidebarContent>
                        <SidebarNavigation />
                      </SidebarContent>
                      <SidebarUserFooter />
                    </Sidebar>
                  </SidebarProvider>
                </SheetContent>
              </Sheet>
              <SidebarTrigger className="h-10 w-10 hidden lg:inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground" />
              <h1 className="text-lg md:text-xl font-bold font-headline">DeciMindAI</h1>
            </div>

          </header>



          <div className="flex flex-1 overflow-hidden relative">
            <div className={cn("flex-1 overflow-y-auto min-w-0 transition-all duration-300")}>
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <WelcomeAnimation />
                </div>
              ) : (
                <div className="max-w-[95%] xl:max-w-[90%] mx-auto p-2 sm:p-4 md:p-6 space-y-6 w-full">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 md:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >

                      <div
                        className={`${msg.role === 'assistant' ? 'w-full max-w-full' : 'max-w-[85%] sm:max-w-lg md:max-w-xl lg:max-w-2xl'} group relative`}
                      >
                        <div
                          className={msg.role === 'user'
                            ? "rounded-xl p-3 md:p-4 shadow-sm bg-primary dark:bg-[#181818] text-primary-foreground max-w-full"
                            : "w-full pl-0 max-w-full"
                          }
                        >
                          {msg.role === 'assistant' ? (
                            msg.isThinkResponse ? (
                              <ThinkResponse>
                                <AssistantMessage content={msg.content} onViewCode={handleViewCode} isNewMessage={msg.shouldAnimate} />
                              </ThinkResponse>
                            ) : (
                              <AssistantMessage content={msg.content} onViewCode={handleViewCode} isNewMessage={msg.shouldAnimate} />
                            )
                          ) : editingMessageId === msg.id ? (
                            <div className="bg-[#181818] border border-blue-500/30 rounded-xl p-3 shadow-lg w-full">
                              <textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                className="w-full bg-transparent text-gray-100 placeholder-gray-500 resize-none outline-none focus:ring-0 min-h-[100px] text-sm md:text-base leading-relaxed"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSaveEdit(msg.id);
                                  }
                                }}
                              />
                              <div className="flex justify-end gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="bg-[#2A2A2A] hover:bg-[#333333] text-white rounded-full px-4 h-8 text-xs font-medium"
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 h-8 text-xs font-medium"
                                  onClick={() => handleSaveEdit(msg.id)}
                                >
                                  Send
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                          )}
                        </div>
                        {msg.role === 'user' && !editingMessageId && (
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-7 right-0 px-2">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(msg)}>
                              <Pen className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        {msg.role === 'assistant' && (
                          <div className="flex items-center justify-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-7 left-0 px-2">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => handleCopy(msg.content, msg.id)}>
                              {copiedId === msg.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn("h-6 w-6 text-muted-foreground hover:text-foreground", feedback[msg.id] === 'like' && 'text-green-500')}
                              onClick={() => handleFeedback(msg.id, 'like')}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn("h-6 w-6 text-muted-foreground hover:text-foreground", feedback[msg.id] === 'dislike' && 'text-red-500')}
                              onClick={() => handleFeedback(msg.id, 'dislike')}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                  {isPending && (
                    <div className="flex items-start gap-4 justify-start">

                      <div className="max-w-lg md:max-w-xl lg:max-w-2xl w-full rounded-xl p-4 shadow-sm bg-card flex items-center min-h-[60px]">
                        <div className="pulsing-loader" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
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

        {/* Custom Resize Handle + Code Panel */}
        {activeCode && !isMobile && (
          <>
            {/* Resize Handle */}
            <div
              className="w-1 bg-border hover:bg-primary/70 active:bg-primary transition-colors relative group cursor-col-resize select-none flex-shrink-0"
              onMouseDown={startResizing}
              title="Drag to resize"
            >
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 items-center justify-center bg-background/80 backdrop-blur-sm rounded-full p-1.5 pointer-events-none">
                <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                <div className="w-1 h-1 rounded-full bg-muted-foreground" />
              </div>
            </div>

            {/* Code Panel */}
            <div
              className="bg-background/95 backdrop-blur border-l flex-shrink-0"
              style={{
                width: `${panelWidth}%`,
                transition: isResizingRef.current ? 'none' : 'width 0.2s ease-out'
              }}
            >
              <div className="flex flex-col h-full w-full min-w-[320px]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                  <span className="text-xs font-mono text-muted-foreground">v1</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1.5 border-border hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleCopy(activeCode || '', 'side-panel-copy')}
                    >
                      {copiedId === 'side-panel-copy' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      {copiedId === 'side-panel-copy' ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs gap-1.5 bg-foreground text-background hover:bg-foreground/90 font-medium"
                    >
                      Publish
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                      onClick={handleCloseCode}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-0 bg-background dark:bg-[#0d1117] custom-scrollbar">
                  {activeCode && (
                    <div className="p-4">
                      <MarkdownRenderer content={`\`\`\`${activeLanguage}\n${activeCode}\n\`\`\``} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function DeciMindPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = use(params);
  return (
    <SidebarProvider>
      <PageContent chatId={chatId} />
    </SidebarProvider>
  );
}
