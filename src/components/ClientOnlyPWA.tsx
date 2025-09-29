'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 动态导入 PWA 组件，禁用 SSR
const PWAInstallPrompt = dynamic(() => import('./PWAInstallPrompt'), {
  ssr: false,
  loading: () => null
});

export default function ClientOnlyPWA() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <PWAInstallPrompt />;
}