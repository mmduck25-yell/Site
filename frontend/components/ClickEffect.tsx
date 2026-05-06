'use client';

import { useEffect, useCallback } from 'react';

export default function ClickEffect() {
  const createRipple = useCallback((e: MouseEvent) => {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${e.clientX - 50}px`;
    ripple.style.top = `${e.clientY - 50}px`;
    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 500);
  }, []);

  useEffect(() => {
    document.addEventListener('click', createRipple);
    return () => {
      document.removeEventListener('click', createRipple);
    };
  }, [createRipple]);

  return null;
}
