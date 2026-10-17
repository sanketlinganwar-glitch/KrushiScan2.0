export function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}sw.js`;
      navigator.serviceWorker
        .register(swUrl)
        .then((reg) => {
          console.log('KrushiScan PWA ServiceWorker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('KrushiScan PWA ServiceWorker registration failed:', err);
        });
    });
  }
}

export function subscribeToOnlineStatus(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
