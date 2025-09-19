'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CreateNewChatPage() {
  const router = useRouter();

  useEffect(() => {
    // This page's sole purpose is to redirect to the first chat session.
    // The actual chat creation logic for "new chat" is handled in the sidebar.
    const newChatId = `guest_${new Date().getTime()}`;
    router.replace(`/chat/${newChatId}`);
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Starting your session...</p>
      </div>
    </div>
  );
}
