import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { Provider } from "./provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { I18nProvider } from "@/context/I18nProvider";
import "@/i18n/config";
import "@/styles/globals.css";

// Registrar service worker solo en producción web (no Tauri)
if ('serviceWorker' in navigator && import.meta.env.PROD && !(window as any).__TAURI__) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err));
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <I18nProvider>
      <BrowserRouter>
        <Provider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </Provider>
      </BrowserRouter>
    </I18nProvider>
  </React.StrictMode>
);
