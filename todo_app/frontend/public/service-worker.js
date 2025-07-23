// service-worker.js

// Cache name
const CACHE_NAME = 'todo-app-cache-v2';

// Log to help with debugging
console.log('Service worker loaded');

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  // Force activation
  self.skipWaiting();
  
  // Send a message to the client that the service worker is installed
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'SW_INSTALLED' });
    });
  });
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  
  // Take control immediately
  event.waitUntil(self.clients.claim());
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  
  // Send a message to the client that the service worker is activated
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'SW_ACTIVATED' });
    });
  });
});

// Push event - handle incoming push notifications
// self.addEventListener('push', (event) => {
//   console.log('Push notification received');
  
//   let title = 'Todo App Reminder';
//   let body;
  
//   try {
//     // Try to parse as JSON
//     const jsonData = JSON.parse(event.data.text());
//     console.log('Parsed notification data:', jsonData);
    
//     if (jsonData.title) {
//       title = jsonData.title;
//     }
    
//     if (jsonData.body) {
//       body = jsonData.body;
//     } else {
//       body = 'You have notifications from Todo App';
//     }
//   } catch (e) {
//     // If not JSON, use as plain text
//     console.log('Using plain text notification');
//     body = event.data.text();
//   }
  
//   const options = {
//     body: body,
//     icon: '/favicon.ico',
//     badge: '/favicon.ico',
//     vibrate: [200, 100, 200, 100, 200],
//     tag: 'todo-notification',  // Group notifications with the same tag
//     renotify: true,  // Notify even if there's an existing notification with the same tag
//     requireInteraction: true,  // Keep notification visible until user interacts with it
//     silent: false,  // Play sound with notification
//     data: {
//       dateOfArrival: Date.now(),
//       primaryKey: 1
//     },
//     actions: [
//       {
//         action: 'explore',
//         title: 'View Tasks'
//       }
//     ]
//   };

//   console.log('Showing notification:', { title, options });
  
//   // Force notification to display by focusing on it
//   // self.clients.matchAll({type: 'window'}).then(windowClients => {
//   //   // Check if there is already a window/tab open with the target URL
//   //   for (var i = 0; i < windowClients.length; i++) {
//   //     var client = windowClients[i];
//   //     // If so, just focus it.
//   //     if (client.url === '/' && 'focus' in client) {
//   //       return client.focus();
//   //     }
//   //   }
//   // });
  
//   event.waitUntil(
//     self.registration.showNotification(title, options)
//   );
// });


self.addEventListener('push', (event) => {
  console.log('Push notification received');

  let title = 'Todo App Reminder';
  let body;

  try {
    const jsonData = JSON.parse(event.data.text());
    console.log('Parsed notification data:', jsonData);

    if (jsonData.title) title = jsonData.title;
    body = jsonData.body || 'You have notifications from Todo App';
  } catch (e) {
    console.log('Using plain text notification');
    body = event.data.text();
  }

  const options = {
    body: body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    tag: 'todo-notification',
    renotify: true,
    requireInteraction: true,
    silent: false,
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Tasks'
      }
    ]
  };

  console.log('Showing notification:', { title, options });

  event.waitUntil(
    self.registration.showNotification(title,options)
  );
});


// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app and focus on it
    event.waitUntil(
      clients.openWindow('/')
        .then((windowClient) => windowClient ? windowClient.focus() : null)
    );
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});