// Try to register service worker.
import loading from './loading';
export default function() {
  const { serviceWorker } = window.MUSE_GLOBAL;
  if (!navigator.serviceWorker) return;
  if (serviceWorker && document.location.protocol === 'https:') {
    loading.showMessage('Registering Muse service worker.');
    return new Promise(resolve => {
      let resolved = false;
      setTimeout(() => {
        if (!resolved) {
          console.log('Failed to register service worker in 10 seconds. Skip it.');
          resolve();
        }
      }, 10000);
      navigator.serviceWorker
        .register(serviceWorker, {})
        .then(function() {
          resolved = true;
          console.log('Service Worker register done.');
          resolve();
        })
        .catch(() => {
          resolved = true;
          console.log('Failed to register service worker, skip it.');
          resolve(); // Tolerate failures
        });
    });
  }
}
