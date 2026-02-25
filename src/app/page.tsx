'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ref, push, set, serverTimestamp, query, orderByChild, limitToLast, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { motion } from 'framer-motion';

export default function CreateNewChatPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Artificial minimum delay for splash screen for better UX
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading || isInitializing) return;

    const initializeChat = async () => {
      if (user) {
        try {
          // Check for existing chats first (optional: redirect to last chat)
          // For now, create new chat as per current flow but cleaner
          const chatsRef = ref(database, `chats/${user.uid}`);
          const newChatRef = push(chatsRef);

          await set(newChatRef, {
            createdAt: serverTimestamp(),
            title: 'New Chat',
          });

          if (newChatRef.key) {
            router.replace(`/chat/${newChatRef.key}`);
          }
        } catch (error) {
          console.error("Error creating chat:", error);
          const guestId = `guest_${new Date().getTime()}`;
          router.replace(`/chat/${guestId}`);
        }
      } else {
        const newChatId = `guest_${new Date().getTime()}`;
        router.replace(`/chat/${newChatId}`);
      }
    };

    initializeChat();
  }, [router, user, loading, isInitializing]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white overflow-hidden relative selection:bg-primary/30">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex flex-col items-center gap-8"
      >
        <div className="relative">
          <motion.div
            animate={{
              boxShadow: ["0 0 20px rgba(59, 130, 246, 0.2)", "0 0 60px rgba(59, 130, 246, 0.4)", "0 0 20px rgba(59, 130, 246, 0.2)"]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="relative w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-white/10 flex items-center justify-center overflow-hidden"
          >
            <img
              src="https://res.cloudinary.com/dhw6yweku/image/upload/v1770712388/Gemini_Generated_Image_82yj7482yj7482yj-removebg-preview_hwhj3p.png"
              alt="DeciMindAI Logo"
              className="w-full h-full object-cover p-2"
            />
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12" />
          </motion.div>

          {/* Loading Ring */}
          <svg className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] animate-[spin_8s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" className="stroke-white/5" strokeWidth="1" />
            <motion.circle
              cx="50" cy="50" r="48"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="1"
              strokeDasharray="40 250"
              strokeLinecap="round"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: 1000 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70"
          >
            DeciMindAI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/50 text-sm md:text-base tracking-widest uppercase"
          >
            Think Deeper. Build Faster.
          </motion.p>
        </div>
      </motion.div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-[10px] text-white/30 uppercase tracking-widest"
        >
          Initializing Neural Interface...
        </motion.p>
      </div>
    </div>
  );
}
