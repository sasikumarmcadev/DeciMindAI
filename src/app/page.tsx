'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ref, push, set, serverTimestamp } from 'firebase/database';
import { database } from '@/lib/firebase';
import { motion } from 'framer-motion';

export default function CreateNewChatPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [progress, setProgress] = useState(0);

  // Drive progress bar over 2 seconds
  useEffect(() => {
    const steps = 40;
    const interval = 2000 / steps;
    let current = 0;

    const ticker = setInterval(() => {
      current += 1;
      setProgress(Math.min((current / steps) * 100, 100));
      if (current >= steps) {
        clearInterval(ticker);
        setIsInitializing(false);
      }
    }, interval);

    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    if (loading || isInitializing) return;

    const initializeChat = async () => {
      if (user) {
        try {
          const chatsRef = ref(database, `chats/${user.uid}`);
          const newChatRef = push(chatsRef);
          await set(newChatRef, {
            createdAt: serverTimestamp(),
            title: 'New Chat',
          });
          if (newChatRef.key) {
            router.replace(`/chat/${newChatRef.key}`);
          }
        } catch {
          router.replace(`/chat/guest_${Date.now()}`);
        }
      } else {
        router.replace(`/chat/guest_${Date.now()}`);
      }
    };

    initializeChat();
  }, [router, user, loading, isInitializing]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0a0a0a] text-white overflow-hidden select-none">

      {/* Center content */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-7"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <img
            src="https://res.cloudinary.com/dhw6yweku/image/upload/v1770712388/Gemini_Generated_Image_82yj7482yj7482yj-removebg-preview_hwhj3p.png"
            alt="DeciMind Logo"
            className="w-full h-full object-cover p-1.5"
          />
        </motion.div>

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-1.5">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl font-semibold tracking-tight text-white"
            style={{ fontFamily: 'PT Sans, sans-serif' }}
          >
            DeciMind<span className="text-white/40">AI</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-light"
          >
            Think Deeper. Build Faster.
          </motion.p>
        </div>
      </motion.div>

      {/* Progress bar — bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
        <motion.div
          className="h-full bg-white/25"
          style={{ width: `${progress}%` }}
          transition={{ ease: 'linear' }}
        />
      </div>

      {/* Version / credit */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-5 text-[10px] text-white/20 tracking-widest uppercase"
      >
        by Sasikumar
      </motion.p>
    </div>
  );
}
