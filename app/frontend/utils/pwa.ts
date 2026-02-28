const SERVICE_WORKER_URL = '/sw.js';
const SERVICE_WORKER_SCOPE = '/';
const UPDATE_INTERVAL_MS = 60 * 60 * 1000;
const PWA_UPDATE_EVENT = 'pwa:update-available';

type ServiceWorkerCommand = {
  type: 'SKIP_WAITING';
};

type PwaUpdateEventDetail = {
  hasWaitingWorker: boolean;
};

let hasRegistered = false;
let latestRegistration: ServiceWorkerRegistration | null = null;
let hasPendingUpdate = false;

function canRegisterServiceWorker(): boolean {
  return 'serviceWorker' in navigator && window.isSecureContext;
}

function isLocalDevelopmentHost(): boolean {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

function requestSkipWaiting(worker: ServiceWorker): void {
  const command: ServiceWorkerCommand = { type: 'SKIP_WAITING' };
  worker.postMessage(command);
}

function emitPwaUpdateAvailable(): void {
  hasPendingUpdate = true;
  const event = new CustomEvent<PwaUpdateEventDetail>(PWA_UPDATE_EVENT, {
    detail: { hasWaitingWorker: true },
  });
  window.dispatchEvent(event);
}

function watchForUpdate(registration: ServiceWorkerRegistration): void {
  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    if (!installing) {
      return;
    }

    installing.addEventListener('statechange', () => {
      const hasInstalledUpdate =
        installing.state === 'installed' &&
        Boolean(navigator.serviceWorker.controller) &&
        Boolean(registration.waiting);

      if (!hasInstalledUpdate || !registration.waiting) {
        return;
      }

      emitPwaUpdateAvailable();
    });
  });
}

function setupControllerReload(): void {
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) {
      return;
    }
    reloading = true;
    window.location.reload();
  });
}

export function registerPwaServiceWorker(): void {
  if (hasRegistered || !canRegisterServiceWorker() || isLocalDevelopmentHost()) {
    return;
  }

  hasRegistered = true;
  setupControllerReload();

  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register(SERVICE_WORKER_URL, { scope: SERVICE_WORKER_SCOPE })
      .then((registration) => {
        latestRegistration = registration;
        if (registration.waiting) {
          emitPwaUpdateAvailable();
        }

        watchForUpdate(registration);
        window.setInterval(() => void registration.update(), UPDATE_INTERVAL_MS);
      })
      .catch((error: unknown) => {
        console.error('[PWA] service worker registration failed', error);
      });
  });
}

export function subscribeToPwaUpdates(onUpdateAvailable: () => void): () => void {
  const listener = () => {
    onUpdateAvailable();
  };

  window.addEventListener(PWA_UPDATE_EVENT, listener as EventListener);
  if (hasPendingUpdate) {
    onUpdateAvailable();
  }

  return () => {
    window.removeEventListener(PWA_UPDATE_EVENT, listener as EventListener);
  };
}

export function hasPendingPwaUpdate(): boolean {
  return hasPendingUpdate;
}

export function applyPendingPwaUpdate(): boolean {
  const waitingWorker = latestRegistration?.waiting;
  if (!waitingWorker) {
    return false;
  }

  requestSkipWaiting(waitingWorker);
  hasPendingUpdate = false;
  return true;
}
