'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ref, push, set, serverTimestamp, query, orderByChild, limitToLast, get } from 'firebase/database';
import { database } from '@/lib/firebase';

export default function CreateNewChatPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // Force create a new chat for now to ensure user gets to a valid page
      // We can restore history redirection later if needed, but priority is access
      const chatsRef = ref(database, `chats/${user.uid}`);
      const newChatRef = push(chatsRef);

      set(newChatRef, {
        createdAt: serverTimestamp(),
        title: 'New Chat',
      }).then(() => {
        if (newChatRef.key) {
          router.replace(`/chat/${newChatRef.key}`);
        }
      }).catch((error) => {
        console.error("Error creating chat:", error);
        // Fallback to guest if something fails horribly
        const guestId = `guest_${new Date().getTime()}`;
        router.replace(`/chat/${guestId}`);
      });

    } else {
      // Guest user logic
      const newChatId = `guest_${new Date().getTime()}`;
      router.replace(`/chat/${newChatId}`);
    }
  }, [router, user, loading]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-primary/70 font-medium animate-pulse">
          {loading ? 'Initializing...' : 'Starting your session...'}
        </p>
      </div>
    </div>
  );
}
