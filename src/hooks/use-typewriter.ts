'use client';

import { useState, useEffect } from 'react';

export function useTypewriter(text: string, speed: number = 20) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      return;
    }

    setDisplayText(''); // Start with an empty string

    let i = 0; // Start from the first character
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
