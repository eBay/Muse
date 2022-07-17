// Try to register service worker.
import loading from './loading';
export default function() {
  const { app } = window.MUSE_GLOBAL;
  if (!navigator.serviceWorker) return;
  if (app.noServiceWorker) {
    // TODO: should we unregister sw? It just means it doesn't use Muse's sw.
    // navigator.serviceWorker
    //   .getRegistrations()
    //   .then(registrations => {
    //     for (let registration of registrations) {
    //       registration.unregister();
    //     }
    //   })
    //   .catch(function(err) {
    //     console.log('Service Worker un-registration failed: ', err);
    //     return Promise.resolve();
    //   });
  } else if (document.location.protocol === 'https:') {
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
        .register('/sw.js', {})
        .then(function() {
          resolved = true;
          console.log('Service Worker register done');
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
