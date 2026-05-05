
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './auth';
import { BRAND_STYLES, BRAND_TOKENS } from './config/brandTokens';
import { registerPwaServiceWorker } from './utils/pwa';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

document.documentElement.dataset.brandStyle = BRAND_TOKENS.styleId;
document.title = `${BRAND_TOKENS.applicationName} | ${BRAND_TOKENS.productName}`;
const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
if (themeColorMeta) {
  themeColorMeta.content = BRAND_STYLES[BRAND_TOKENS.styleId].colors.primary;
}
const applicationNameMeta = document.querySelector<HTMLMetaElement>('meta[name="application-name"]');
if (applicationNameMeta) {
  applicationNameMeta.content = BRAND_TOKENS.applicationName;
}
const faviconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
if (faviconLink) {
  faviconLink.href = BRAND_TOKENS.logo.pwa192;
}
const appleTouchIconLink = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
if (appleTouchIconLink) {
  appleTouchIconLink.href = BRAND_TOKENS.logo.pwa192;
}
const ogImageMeta = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
if (ogImageMeta) {
  ogImageMeta.content = BRAND_TOKENS.logo.horizontal;
}

registerPwaServiceWorker();

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
