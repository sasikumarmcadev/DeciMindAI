'use client';

import { useState, useEffect } from 'react';

export function useTypewriter(text: string, speed: number = 20) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      return;
    }

    // If we've already finished typing this exact text, do nothing.
    if (displayText === text) return;

    // If the new text is a continuation of the current display text (streaming), 
    // we don't want to reset. 
    // If it's a completely new message, we reset.
    if (!text.startsWith(displayText)) {
      setDisplayText('');
    }

    const timer = setInterval(() => {
      setDisplayText((current) => {
        if (current === text) {
          clearInterval(timer);
          return current;
        }

        // Use text from closure? No, 'text' might be stale in the interval if not careful, 
        // but since useEffect depends on [text], the interval is recreated on text change.
        // However, we want to type based on the LATEST text prop.
        // The simple interval restart on text change is acceptable if it resumes correctly.

        if (text.length > current.length) {
          return current + text.charAt(current.length);
        }
        return current;
      });
    }, speed);

    return () => {
      clearInterval(timer);
    };
  }, [text, speed]);

  return displayText;
}
