'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // 防止水合错误
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 添加调试信息
  const addDebugInfo = (message: string) => {
    console.log('PWA Debug:', message);
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    if (!isMounted) return;
    
    addDebugInfo('PWA component mounted');
    
    // 检查是否已经安装（多种方式检测）
    const checkInstallStatus = () => {
      // 方式1: 检查 display-mode
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        addDebugInfo('PWA already installed (standalone mode)');
        setIsInstalled(true);
        return true;
      }
      
      // 方式2: 检查 navigator.standalone (iOS)
      if ((window.navigator as any).standalone === true) {
        addDebugInfo('PWA already installed (iOS standalone)');
        setIsInstalled(true);
        return true;
      }
      
      // 方式3: 检查 URL 参数
      if (window.location.search.includes('utm_source=homescreen')) {
        addDebugInfo('PWA already installed (homescreen launch)');
        setIsInstalled(true);
        return true;
      }
      
      addDebugInfo('PWA not installed');
      return false;
    };

    if (checkInstallStatus()) {
      return;
    }

    // 监听 PWA 安装提示事件
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      addDebugInfo('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      // 延迟显示安装提示，让用户先体验应用
      setTimeout(() => {
        addDebugInfo('Showing PWA install prompt after delay');
        setShowPrompt(true);
      }, 5000); // 5 秒后显示（减少延迟用于测试）
    };

    // 监听 PWA 安装完成事件
    const handleAppInstalled = () => {
      addDebugInfo('PWA was installed');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    // 对于开发环境，模拟 beforeinstallprompt 事件
    if (process.env.NODE_ENV === 'development') {
      addDebugInfo('Development mode: setting up PWA simulation');
      setTimeout(() => {
        if (!isInstalled && !deferredPrompt) {
          addDebugInfo('Development mode: simulating beforeinstallprompt');
          // 创建一个模拟的事件对象
          const mockEvent = {
            platforms: ['web'],
            userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
            prompt: () => {
              addDebugInfo('Mock PWA install triggered');
              return Promise.resolve();
            },
            preventDefault: () => {}
          } as BeforeInstallPromptEvent;
          
          setDeferredPrompt(mockEvent);
          setShowPrompt(true);
        }
      }, 3000);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isMounted, isInstalled, deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      addDebugInfo('No deferred prompt available');
      return;
    }

    try {
      addDebugInfo('Triggering PWA install prompt');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        addDebugInfo('User accepted the install prompt');
      } else {
        addDebugInfo('User dismissed the install prompt');
      }
    } catch (error) {
      addDebugInfo(`Install prompt error: ${error}`);
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    addDebugInfo('User dismissed PWA prompt');
    setShowPrompt(false);
    // 24 小时后再次显示
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  };

  // 检查是否在24小时内被拒绝过
  useEffect(() => {
    if (!isMounted) return;
    
    const dismissed = localStorage.getItem('pwa-dismissed');
    console.log('Checking PWA dismiss status:', dismissed);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - dismissedTime < twentyFourHours) {
        console.log('PWA prompt was dismissed within 24 hours, not showing');
        setShowPrompt(false);
      } else {
        console.log('PWA dismiss timeout expired, can show prompt');
      }
    } else {
      console.log('PWA has never been dismissed');
    }
  }, [isMounted]);

  // 调试信息
  console.log('PWA Install Prompt render conditions:', {
    isInstalled,
    showPrompt,
    hasDeferredPrompt: !!deferredPrompt,
    isMounted
  });

  // 防止水合错误，只在客户端挂载后渲染
  if (!isMounted) {
    return null;
  }

  // 开发环境下显示测试按钮
  if (process.env.NODE_ENV === 'development' && !isInstalled) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        {/* 主安装提示 */}
        {showPrompt && deferredPrompt && (
          <div className="mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-80 animate-slide-up">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <Download className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    安装应用
                  </h3>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              安装我们的应用以获得更快的访问速度和离线功能。
            </p>
            
            <div className="flex space-x-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                安装
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                稍后
              </button>
            </div>
          </div>
        )}
        
        {/* 测试按钮 */}
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-xs">
          <div className="mb-2 font-semibold text-yellow-800">PWA 测试工具</div>
          <div className="space-y-1 text-yellow-700">
            <div>已安装: {isInstalled ? '是' : '否'}</div>
            <div>显示提示: {showPrompt ? '是' : '否'}</div>
            <div>有安装事件: {deferredPrompt ? '是' : '否'}</div>
            <div>浏览器: {navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other'}</div>
          </div>
          <div className="mt-2 space-y-1">
            <button
              onClick={() => {
                addDebugInfo('Forcing prompt display');
                setShowPrompt(true);
              }}
              className="w-full bg-yellow-600 text-white px-2 py-1 rounded text-xs hover:bg-yellow-700"
            >
              强制显示提示
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('pwa-dismissed');
                addDebugInfo('Cleared PWA dismiss status');
              }}
              className="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
            >
              清除拒绝状态
            </button>
            <button
              onClick={() => {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(registrations => {
                    addDebugInfo(`Found ${registrations.length} service workers`);
                  });
                }
              }}
              className="w-full bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
            >
              检查 SW 状态
            </button>
          </div>
          
          {/* 调试信息 */}
          <div className="mt-2 max-h-20 overflow-y-auto text-xs">
            <div className="font-semibold text-yellow-800 mb-1">调试日志:</div>
            {debugInfo.map((info, index) => (
              <div key={index} className="text-yellow-600 text-xs break-all">
                {info}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Download className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              Install App
            </h3>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Install our app for faster access and offline functionality.
      </p>
      
      <div className="flex space-x-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Later
        </button>
      </div>
    </div>
  );
}