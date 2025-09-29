'use client';

import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // 检查网络状态
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // 网络恢复时，自动返回首页
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {/* 网络状态指示器 */}
        <div className="mb-6">
          {isOnline ? (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
              </svg>
            </div>
          )}
        </div>

        {/* 标题和描述 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {isOnline ? '网络已恢复！' : '当前处于离线模式'}
        </h1>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {isOnline 
            ? '您的网络连接已恢复，即将自动返回应用...'
            : '看起来您的网络连接出现了问题。请检查您的网络设置并重试。'
          }
        </p>

        {/* 网络状态显示 */}
        <div className="mb-6">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isOnline 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isOnline ? '在线' : '离线'}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          {isOnline ? (
            <div className="flex items-center justify-center text-blue-600">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在重新连接...
            </div>
          ) : (
            <>
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                重新加载
              </button>
              
              <button
                onClick={handleGoHome}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                返回首页
              </button>
            </>
          )}
        </div>

        {/* 提示信息 */}
        <div className="mt-6 text-sm text-gray-500">
          <p>💡 此应用支持离线使用部分功能</p>
        </div>
      </div>
    </div>
  );
}