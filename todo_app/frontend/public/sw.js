self.addEventListener('push', function (e) {
  const data = e.data.text();
  const options = {
    body: data,
    icon: '/icon-512.png',
    badge: '/badge-icon.png',
  };
  e.waitUntil(
    self.registration.showNotification('📝 Task Reminder', options)
  );
});
