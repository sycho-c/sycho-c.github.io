const CACHE_NAME = 'saltnlight-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/manifest.json',
    '/assets/icons/icon-72x72.png',
    '/assets/icons/icon-96x96.png',
    '/assets/icons/icon-128x128.png',
    '/assets/icons/icon-144x144.png',
    '/assets/icons/icon-152x152.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-384x384.png',
    '/assets/icons/icon-512x512.png',
    '/assets/icons/favicon.ico',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap'
];

// 서비스 워커 설치 및 자원 캐싱
self.addEventListener('install', (event) => {
    console.log('서비스 워커 설치 중...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('자원을 캐시에 저장 중...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                // 기존 서비스 워커를 대기하지 않고 즉시 활성화
                return self.skipWaiting();
            })
    );
});

// 캐시 정리 (새 버전 배포 시)
self.addEventListener('activate', (event) => {
    console.log('서비스 워커 활성화 중...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // 현재 캐시 이외의 이전 캐시 삭제
                    if (cacheName !== CACHE_NAME) {
                        console.log('이전 캐시 삭제 중:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // 페이지 새로고침 없이 서비스 워커 제어 가능
            return self.clients.claim();
        })
    );
});

// 네트워크 요청 가로채기 및 캐시 응답
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 캐시에서 자원 발견
                if (response) {
                    return response;
                }
                
                // 캐시에 없으면 네트워크에서 가져옴
                return fetch(event.request)
                    .then((networkResponse) => {
                        // 성공적인 응답만 캐시
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // 응답 복제 (스트림은 한 번만 사용 가능)
                        const responseToCache = networkResponse.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                // 향후 사용을 위해 응답 캐싱
                                cache.put(event.request, responseToCache);
                            });
                            
                        return networkResponse;
                    })
                    .catch(() => {
                        // 네트워크 실패 시 오프라인 페이지 제공 (옵션)
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        // 이미지 요청 실패 시 기본 이미지 제공 (옵션)
                        if (event.request.destination === 'image') {
                            return caches.match('/assets/icons/icon-512x512.png');
                        }
                    });
            })
    );
});

// 푸시 알림 수신 처리
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const notification = event.data.json();
    const title = notification.title || 'saltnlight';
    const options = {
        body: notification.body || '새로운 알림이 있습니다.',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        data: notification.data
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // 이미 열린 창이 있는지 확인
                for (const client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // 새 창 열기
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
}); 
