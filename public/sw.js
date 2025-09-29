const CACHE_NAME = 'app-store-reviews-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline',
  '/offline.html',
  '/favicon.ico',
  // 添加其他关键静态资源
];

// 需要动态缓存的路径模式
const CACHE_PATTERNS = [
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
  /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/
];

// 不应该缓存的路径
const EXCLUDE_PATTERNS = [
  /\/api\/(?!sitemap|robots)/,  // 排除 API 请求（除了 sitemap 和 robots）
  /chrome-extension/,
  /moz-extension/,
  /safari-extension/,
  /^blob:/,
  /^data:/
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker installed successfully');
        // 立即激活新的 Service Worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated successfully');
      // 立即控制所有打开的页面
      return self.clients.claim();
    })
  );
});

// 工具函数：检查 URL 是否应该被缓存
function shouldCache(url) {
  // 检查排除模式
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(url)) {
      return false;
    }
  }
  
  // 检查是否是同源请求
  try {
    const requestUrl = new URL(url);
    const currentUrl = new URL(self.location.origin);
    
    if (requestUrl.origin === currentUrl.origin) {
      return true;
    }
    
    // 检查是否匹配允许的外部资源模式
    for (const pattern of CACHE_PATTERNS) {
      if (pattern.test(url)) {
        return true;
      }
    }
  } catch (e) {
    console.warn('Invalid URL:', url);
    return false;
  }
  
  return false;
}

// 拦截请求
self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;
  
  // 过滤掉不支持的协议和扩展请求
  if (!shouldCache(requestUrl)) {
    return;
  }

  // 对于导航请求（页面请求），使用网络优先策略
  if (event.request.mode === 'navigate') {
    console.log('Navigation request:', requestUrl);
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          console.log('Network response success for:', requestUrl);
          // 缓存成功的页面响应
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch((error) => {
          console.log('Network failed for navigation:', requestUrl, error);
          // 网络失败，尝试从缓存获取
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('Serving cached page for:', requestUrl);
                return cachedResponse;
              }
              console.log('No cached page, serving offline page');
              // 最后回退到离线页面
              return caches.match('/offline')
                .then((offlineResponse) => {
                  if (offlineResponse) {
                    console.log('Serving /offline page');
                    return offlineResponse;
                  }
                  // 如果 Next.js 离线页面没有缓存，尝试静态 HTML 页面
                  return caches.match('/offline.html');
                })
                .then((fallbackResponse) => {
                  if (fallbackResponse) {
                    console.log('Serving /offline.html page');
                    return fallbackResponse;
                  }
                  console.log('No offline pages cached, serving generated offline page');
                  // 如果所有离线页面都没有缓存，返回一个简单的离线响应
                  return new Response(`
                    <!DOCTYPE html>
                    <html lang="zh-CN">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>离线模式</title>
                      <style>
                        body { 
                          font-family: system-ui, sans-serif; 
                          text-align: center; 
                          padding: 50px;
                          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                          min-height: 100vh;
                          margin: 0;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                        }
                        .offline-container { 
                          max-width: 500px; 
                          background: white;
                          padding: 40px;
                          border-radius: 16px;
                          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                        }
                        .offline-icon { 
                          font-size: 4rem; 
                          margin-bottom: 1rem; 
                        }
                        h1 { 
                          color: #374151; 
                          margin-bottom: 1rem; 
                          font-size: 24px;
                        }
                        p { 
                          color: #6b7280; 
                          line-height: 1.6; 
                          margin-bottom: 24px;
                        }
                        .retry-btn { 
                          background: #3b82f6; 
                          color: white; 
                          border: none; 
                          padding: 12px 24px; 
                          border-radius: 6px; 
                          cursor: pointer; 
                          margin: 8px;
                          font-size: 1rem;
                          transition: background 0.2s;
                        }
                        .retry-btn:hover { 
                          background: #2563eb; 
                        }
                      </style>
                    </head>
                    <body>
                      <div class="offline-container">
                        <div class="offline-icon">📱</div>
                        <h1>当前处于离线模式</h1>
                        <p>看起来您的网络连接出现了问题。请检查您的网络连接并重试。</p>
                        <button class="retry-btn" onclick="window.location.reload()">重新加载</button>
                        <button class="retry-btn" onclick="window.location.href='/'" style="background: #6b7280;">返回首页</button>
                      </div>
                      <script>
                        // 监听网络状态变化
                        window.addEventListener('online', () => {
                          setTimeout(() => window.location.reload(), 1000);
                        });
                        
                        // 显示调试信息
                        console.log('Generated offline page served');
                      </script>
                    </body>
                    </html>
                  `, {
                    headers: { 'Content-Type': 'text/html; charset=utf-8' }
                  });
                });
            });
        })
    );
    return;
  }

  // 对于其他请求，使用缓存优先策略
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // 从网络获取
        return fetch(event.request)
          .then((response) => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 克隆响应并缓存
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(event.request, responseClone);
              })
              .catch((error) => {
                console.warn('Failed to cache response:', error);
              });

            return response;
          })
          .catch((error) => {
            console.warn('Fetch failed:', error);
            // 对于图片等资源，可以返回一个默认的占位符
            return new Response('Network error', { 
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// 处理消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// 错误处理
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled promise rejection:', event.reason);
});

// 后台同步 (如果支持)
if ('sync' in self.registration) {
  self.addEventListener('sync', (event) => {
    console.log('Background sync triggered:', event.tag);
    // 这里可以添加后台同步逻辑
  });
}

// 推送通知 (如果需要)
self.addEventListener('push', (event) => {
  console.log('Push message received:', event);
  // 这里可以添加推送通知处理逻辑
});

console.log('Service Worker script loaded successfully');