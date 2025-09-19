'use client';

import { useState, useEffect } from 'react';

export function useTypewriter(text: string, speed: number = 20) {
  const [displayText, setDisplayText] = useState(text ? text.charAt(0) : '');

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      return;
    }

    setDisplayText(text.charAt(0));

    let i = 1;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => {
      clearInterval(timer);
    };
  }, [text, speed]);

  return displayText;
}
