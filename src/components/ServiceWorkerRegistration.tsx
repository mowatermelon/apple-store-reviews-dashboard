'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          console.log('Registering Service Worker...');
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered successfully:', registration);
          
          // 监听 Service Worker 更新
          registration.addEventListener('updatefound', () => {
            console.log('Service Worker update found');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New Service Worker installed, refresh to update');
                  // 可以在这里显示更新提示
                }
              });
            }
          });
          
          // 监听 Service Worker 激活
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service Worker controller changed');
          });
          
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      });
    } else {
      console.log('Service Worker is not supported');
    }
  }, []);

  return null;
}