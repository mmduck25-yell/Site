'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ScrollButtons() {
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show buttons when page is scrollable
      setShowButtons(document.documentElement.scrollHeight > window.innerHeight);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  if (!showButtons) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={scrollToTop}
        className="h-10 w-10 rounded-full border-border bg-background/50 opacity-50 backdrop-blur-sm transition-opacity hover:opacity-100"
        aria-label="위로 스크롤"
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={scrollToBottom}
        className="h-10 w-10 rounded-full border-border bg-background/50 opacity-50 backdrop-blur-sm transition-opacity hover:opacity-100"
        aria-label="아래로 스크롤"
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  );
}
