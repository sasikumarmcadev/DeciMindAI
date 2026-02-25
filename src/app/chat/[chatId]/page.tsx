'use client';

import { useState, useRef, useEffect, useTransition, use, useCallback } from 'react';
import { Bot, User, Trash2, Loader2, MessageSquare, Settings, Plus, LogOut, LogIn, Sun, Moon, ChevronsUpDown, ChevronsLeft, ChevronsRight, Copy, Check, ThumbsUp, ThumbsDown, Lightbulb, Code, Pen, FolderCode, Save, X, Link as LinkIcon, Share2, Mail, Twitter, Instagram } from 'lucide-react';
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
import LightRays from '@/components/ui/light-rays';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase';
import { ref, onValue, off, push, serverTimestamp, remove, set, update } from 'firebase/database';
import Orb from '@/components/ui/Orb';
import { Input } from '@/components/ui/input';
import { ThinkResponse } from '@/components/ui/think-response';
import { SmartNotes } from '@/components/smart-notes';


type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isThinkResponse?: boolean;
  isStudyResponse?: boolean;
  images?: string[];
  isPptResponse?: boolean;
  pptData?: any;
  isQuizResponse?: boolean;
  quizData?: any;
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
import { PptPreview } from '@/components/ui/ppt-preview';
import { QuizViewer } from '@/components/ui/quiz-viewer';

function WelcomeAnimation() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full h-full text-center flex flex-col items-center justify-center font-sans p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1.8}
          lightSpread={3}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          className="opacity-50 dark:opacity-30"
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
      </div>

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


function SidebarHeader() {
  const { isOpen } = useSidebar();
  return (
    <div className="flex items-center h-14 px-4 border-b shrink-0">
      <Logo isOpen={isOpen} />
    </div>
  )
}

// Fixed "New Chat" button component
function SidebarNewChat() {
  const { isOpen } = useSidebar();
  const { user } = useAuth();
  const router = useRouter();

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
    <SidebarGroup className="pb-0">
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleNewChat} tooltip="New Chat" className="bg-primary/10 text-primary hover:bg-primary/20">
              <Plus className="text-primary" />
              {isOpen && <span className="font-semibold">New Chat</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}


// Fixed "Settings" button component
function SidebarSettings() {
  const { isOpen } = useSidebar();
  return (
    <SidebarGroup className="pt-0">
      <SidebarGroupContent>
        <SidebarMenu>
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
  )
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
          const chatList = Object.entries(data)
            .map(([id, chat]: [string, any]) => ({
              id,
              ...chat,
            }))
            .filter(chat => chat.title !== 'New Chat');
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

  return (
    <SidebarGroup className="pt-0">
      <SidebarGroupContent>
        <SidebarMenu>
          {isOpen && chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                onClick={() => router.push(`/chat/${chat.id}`)}
                tooltip={chat.title}
                className="justify-between group"
              >
                <span className="truncate">{chat.title}</span>
                <div
                  role="button"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this chat?')) {
                      if (user) {
                        const chatRef = ref(database, `chats/${user.uid}/${chat.id}`);
                        remove(chatRef);
                        if (window.location.pathname.includes(chat.id)) {
                          router.push('/');
                        }
                      }
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
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
  const [chatCopied, setChatCopied] = useState(false);

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

    // Don't append [Attached: ...] to the visible message since we display images now
    const fullMessage = message;

    // Extract base64 images to store with the message
    let messageImages: string[] = [];

    const isNewChat = messages.length === 0;

    startTransition(async () => {
      // Process files first to get base64 data
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

          // Filter out images for display
          if (processedFiles) {
            messageImages = processedFiles
              .filter(f => f.type.startsWith('image/'))
              .map(f => f.content);
          }

        } catch (error) {
          console.error("Error processing files:", error);
        }
      }

      const isPptMode = fullMessage.startsWith("[PPT: ");
      const isSearchMode = fullMessage.startsWith("[Search: ");
      const isThinkMode = fullMessage.startsWith("[Think: ");
      const isStudyMode = fullMessage.startsWith("[Study: ");
      const isQuizMode = fullMessage.startsWith("[Quiz: ");

      const trimmedMessage = (isPptMode || isSearchMode || isThinkMode || isStudyMode || isQuizMode)
        ? fullMessage.substring(fullMessage.indexOf(' ') + 1, fullMessage.length - 1)
        : fullMessage;

      const userMessage: Message = {
        role: 'user',
        content: isPptMode ? trimmedMessage : fullMessage,
        id: `local_${Date.now()}`,
        images: messageImages
      };

      if (user && !chatId.startsWith('guest_')) {
        const messagesRef = ref(database, `chats/${user.uid}/${chatId}/messages`);
        push(messagesRef, { role: 'user', content: isPptMode ? trimmedMessage : fullMessage, images: messageImages });

        // Set the chat title to the user's prompt if it's a new chat
        if (isNewChat) {
          const chatRef = ref(database, `chats/${user.uid}/${chatId}`);
          // Truncate to 100 characters to avoid excessively long titles
          const title = trimmedMessage.length > 100 ? trimmedMessage.substring(0, 100) + '...' : trimmedMessage;
          update(chatRef, { title });
        }
      } else {
        setMessages(prev => [...prev, userMessage]);
      }

      if (isPptMode) {
        try {
          const id = `local_${Date.now() + 1}`;
          const pendingMessage: Message = {
            role: 'assistant',
            content: "Generating your presentation... Please wait while I create formatting and compile the `.pptx` slides. The download will start automatically.",
            id,
            isPptResponse: true
          };
          setMessages(prev => [...prev, pendingMessage]);

          const res = await fetch("/api/generate-ppt", {
            method: "POST",
            body: JSON.stringify({ topic: trimmedMessage }),
            headers: { "Content-Type": "application/json" },
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to generate PPT parameters");
          }

          const responseData = await res.json();
          // Assume responseData contains presentation object matching PresentationData

          if (!responseData || !responseData.slides || responseData.slides.length === 0) {
            throw new Error("Invalid presentation format generated by AI");
          }

          const successMessage: Message = {
            role: 'assistant',
            content: `✨ I've generated the presentation structure for **"${trimmedMessage}"**! You can view and edit the slides interactively below before downloading.`,
            id: `local_${Date.now() + 2}`,
            isPptResponse: true,
            pptData: responseData,
            shouldAnimate: true
          };

          if (user && !chatId.startsWith('guest_')) {
            const messagesRef = ref(database, `chats/${user.uid}/${chatId}/messages`);
            push(messagesRef, {
              role: 'assistant',
              content: successMessage.content,
              isPptResponse: true,
              pptData: responseData,
            });
          } else {
            setMessages(prev => {
              const newArr = prev.filter(m => m.id !== id);
              return [...newArr, successMessage];
            });
          }

        } catch (error: any) {
          console.error(error);
          toast({
            title: "Generation Failed",
            description: error.message || "An unknown error occurred while creating your presentation.",
            variant: "destructive",
          });
          setMessages(prev => {
            const newArr = prev.filter(m => m.isPptResponse && m.content.includes("Generating"));
            return [...prev.filter(m => m.id !== newArr[0]?.id), {
              role: 'assistant',
              content: `❌ **Failed to generate PPT:** ${error.message || "An unknown error occurred."}`,
              id: `local_${Date.now() + 2}`,
              isPptResponse: true
            }];
          });
        }
        return; // Skip normal generation
      }

      if (isQuizMode) {
        try {
          const id = `local_${Date.now() + 1}`;
          const pendingMessage: Message = {
            role: 'assistant',
            content: "Generating your quiz... Please wait while I create high-quality, concept-based questions.",
            id,
            isQuizResponse: true
          };
          setMessages(prev => [...prev, pendingMessage]);

          const res = await fetch("/api/generate-quiz", {
            method: "POST",
            body: JSON.stringify({ topic: trimmedMessage, numberRecord: 5, difficulty: "medium" }),
            headers: { "Content-Type": "application/json" },
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to generate quiz");
          }

          const responseData = await res.json();

          if (!responseData || !responseData.questions || responseData.questions.length === 0) {
            throw new Error("Invalid quiz format generated by AI");
          }

          const successMessage: Message = {
            role: 'assistant',
            content: `🧠 I've generated a quiz for **"${trimmedMessage}"**! Test your knowledge below.`,
            id: `local_${Date.now() + 2}`,
            isQuizResponse: true,
            quizData: responseData,
            shouldAnimate: true
          };

          if (user && !chatId.startsWith('guest_')) {
            const messagesRef = ref(database, `chats/${user.uid}/${chatId}/messages`);
            push(messagesRef, {
              role: 'assistant',
              content: successMessage.content,
              isQuizResponse: true,
              quizData: responseData,
            });
          } else {
            setMessages(prev => {
              const newArr = prev.filter(m => m.id !== id);
              return [...newArr, successMessage];
            });
          }

        } catch (error: any) {
          console.error(error);
          toast({
            title: "Quiz Generation Failed",
            description: error.message || "An unknown error occurred while creating your quiz.",
            variant: "destructive",
          });
          setMessages(prev => {
            const newArr = prev.filter(m => m.isQuizResponse && m.content.includes("Generating"));
            return [...prev.filter(m => m.id !== newArr[0]?.id), {
              role: 'assistant',
              content: `❌ **Failed to generate quiz:** ${error.message || "An unknown error occurred."}`,
              id: `local_${Date.now() + 2}`,
              isQuizResponse: true
            }];
          });
        }
        return; // Skip normal generation
      }

      const currentHistory = messages.map(({ role, content }) => ({ role, content }));

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
        isThinkResponse: result.isThinkResponse ?? false,
        isStudyResponse: result.isStudyResponse ?? false,
        shouldAnimate: true
      };

      if (user && !chatId.startsWith('guest_')) {
        const messagesRef = ref(database, `chats/${user.uid}/${chatId}/messages`);
        push(messagesRef, {
          role: 'assistant',
          content: responseContent,
          isThinkResponse: result.isThinkResponse ?? false,
          isStudyResponse: result.isStudyResponse ?? false
        });

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
    <div className={cn("rounded-md flex h-[100dvh] w-full flex-1 max-w-full mx-auto overflow-hidden")}>
      <Sidebar className="hidden lg:flex rounded-tr-[1.3rem] rounded-br-[1.3rem] border-r mr-2 flex-col">
        <SidebarHeader />
        <SidebarNewChat />

        <SidebarContent>
          <SidebarNavigation />
        </SidebarContent>
        <SidebarSettings />
        <SidebarUserFooter />
      </Sidebar>

      {/* Main content area with custom resizable split */}
      <div className="flex flex-1 h-full min-h-0">
        {/* Main Chat Area */}
        <main
          className="flex flex-col flex-1 h-full bg-background min-w-0 overflow-hidden relative"
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
                  <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                  <SidebarProvider initialState={true}>
                    <Sidebar className="flex w-full flex-col">
                      <SidebarHeader />
                      <SidebarNewChat />

                      <SidebarContent>
                        <SidebarNavigation />
                      </SidebarContent>
                      <SidebarSettings />
                      <SidebarUserFooter />
                    </Sidebar>
                  </SidebarProvider>
                </SheetContent>
              </Sheet>
              <SidebarTrigger className="h-10 w-10 hidden lg:inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground" />
              <h1 className="text-lg md:text-xl font-bold font-headline">DeciMindAI</h1>
            </div>

            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium hidden sm:flex"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-card border-border">
                  <DialogHeader>
                    <DialogTitle>Share this chat</DialogTitle>
                    <DialogDescription>
                      Choose how you want to share this conversation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-4 gap-4 py-4">
                    {/* WhatsApp */}
                    <button
                      className="flex flex-col items-center gap-2 group"
                      onClick={() => {
                        const url = window.location.href;
                        const text = `Check out this chat on DeciMindAI: ${url}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                        {/* WhatsApp "W" Icon fallback contextually appropriate */}
                        <div className="w-6 h-6 text-[#25D366] font-bold text-center leading-none text-xl">W</div>
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground">WhatsApp</span>
                    </button>

                    {/* Twitter/X */}
                    <button
                      className="flex flex-col items-center gap-2 group"
                      onClick={() => {
                        const url = window.location.href;
                        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent("Check out this chat on DeciMindAI")}`, '_blank');
                      }}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center group-hover:bg-[#1DA1F2]/20 transition-colors">
                        <Twitter className="w-6 h-6 text-[#1DA1F2]" />
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground">Twitter</span>
                    </button>

                    {/* Email */}
                    <button
                      className="flex flex-col items-center gap-2 group"
                      onClick={() => {
                        const url = window.location.href;
                        const subject = "Check out this chat on DeciMindAI";
                        const body = `I thought you might find this interesting:\n\n${url}`;
                        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                      }}
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-zinc-700 transition-colors">
                        <Mail className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground">Email</span>
                    </button>

                    {/* Instagram (Proxy via Copy) */}
                    <button
                      className="flex flex-col items-center gap-2 group"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast({ title: "Link Copied", description: "Paste this link in Instagram." });
                      }}
                    >
                      <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                        <Instagram className="w-6 h-6 text-pink-500" />
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground">Instagram</span>
                    </button>

                    {/* Copy Link */}
                    <button
                      className="flex flex-col items-center gap-2 group"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast({ title: "Link Copied", description: "Chat link copied to clipboard." });
                      }}
                    >
                      <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                        <LinkIcon className="w-6 h-6 text-orange-500" />
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground">Copy Link</span>
                    </button>

                    {/* Native System Share */}
                    <button
                      className="flex flex-col items-center gap-2 group"
                      onClick={async () => {
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: 'DeciMindAI Chat',
                              text: 'Check out this conversation!',
                              url: window.location.href,
                            });
                          } catch (err) {
                            console.log('Error sharing:', err);
                          }
                        } else {
                          toast({ title: "Not Supported", description: "System share is not available on this device.", variant: "destructive" });
                        }
                      }}
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                        <Share2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground">System</span>
                    </button>

                  </div>
                </DialogContent>
              </Dialog>
            </div>

          </header>



          <div className="flex flex-1 overflow-hidden relative min-h-0 max-h-full">
            <div className={cn("flex-1 overflow-y-auto min-w-0 transition-all duration-300 custom-scrollbar")}>
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
                          {msg.images && msg.images.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {msg.images.map((img, i) => (
                                <div key={i} className="relative rounded-lg overflow-hidden border border-border/50 max-w-full">
                                  <img src={img} alt="Uploaded attachment" className="max-h-60 object-contain rounded-lg" />
                                </div>
                              ))}
                            </div>
                          )}
                          {msg.role === 'assistant' ? (
                            msg.isStudyResponse ? (
                              <SmartNotes content={msg.content} />
                            ) : msg.isPptResponse && msg.pptData ? (
                              <div className="flex flex-col gap-2">
                                <AssistantMessage content={msg.content} onViewCode={handleViewCode} isNewMessage={msg.shouldAnimate} />
                                <PptPreview initialData={msg.pptData} topic={msg.content} />
                              </div>
                            ) : msg.isQuizResponse && msg.quizData ? (
                              <div className="flex flex-col gap-4">
                                <AssistantMessage content={msg.content} onViewCode={handleViewCode} isNewMessage={msg.shouldAnimate} />
                                <QuizViewer data={msg.quizData} topic={msg.content} />
                              </div>
                            ) : msg.isThinkResponse ? (
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
          <footer className="p-2 md:p-4 bg-background/95 backdrop-blur-md border-t border-border/40 w-full max-w-4xl mx-auto flex-shrink-0 relative z-30">
            <PromptInputBox
              onSend={handleSendMessage}
              isLoading={isPending}
              placeholder="Message DeciMind..."
              className="border-border shadow-2xl shadow-primary/5"
            />
          </footer>
        </main>

        {/* Custom Resize Handle + Code Panel */}
        {activeCode && (
          <>
            {/* Resize Handle - Desktop Only */}
            <div
              className={cn(
                "w-1 bg-border hover:bg-primary/70 active:bg-primary transition-colors relative group cursor-col-resize select-none flex-shrink-0 hidden md:block",
                isDragging && "bg-primary"
              )}
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
              className={cn(
                "bg-background border-l flex-shrink-0",
                "fixed inset-0 z-[100] w-full h-full md:static md:w-auto md:h-auto md:inset-auto md:z-0"
              )}
              style={!isMobile ? {
                width: `${panelWidth}%`,
                transition: isResizingRef.current ? 'none' : 'width 0.2s ease-out'
              } : {}}
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
