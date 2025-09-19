'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { database } from '@/lib/firebase';
import { ref, push, serverTimestamp, set } from 'firebase/database';
import { Loader2 } from 'lucide-react';

export default function CreateNewChatPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (user) {
      const chatsRef = ref(database, `chats/${user.uid}`);
      const newChatRef = push(chatsRef);
      const newChatId = newChatRef.key;

      const newChatData = {
        createdAt: serverTimestamp(),
        title: 'New Chat',
      };

      // Set the initial chat data
      set(newChatRef, newChatData).then(() => {
        // Redirect to the new chat page
        if (newChatId) {
          router.replace(`/chat/${newChatId}`);
        }
      }).catch(error => {
        console.error("Failed to create new chat:", error);
        // Optionally, handle the error (e.g., show a toast message)
        // For now, redirecting to a generic chat page or showing an error state might be good.
        router.replace('/'); // Or an error page
      });
    } else {
      // If user is not logged in, redirect to a landing page or login page
      // For this example, let's assume we want to redirect them to a conceptual login page
      // or just stay on a page that prompts them to log in.
      // Since we don't have a login page, we'll redirect to the main page which has the login button.
      // A better approach would be to have a dedicated landing/login page.
      // For now, we create a temporary chat page for guests.
      const newChatId = `guest_${new Date().getTime()}`;
      router.replace(`/chat/${newChatId}`);
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Creating a new chat...</p>
      </div>
    </div>
  );
}
