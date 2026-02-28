import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Register service worker for Web Push notifications
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[SW] Registered, scope:", reg.scope);
        // Ask for notification permission after first user interaction
        document.addEventListener(
          "click",
          () => {
            if (Notification.permission === "default") {
              Notification.requestPermission().then((perm) => {
                console.log("[Push] Permission:", perm);
              });
            }
          },
          { once: true }
        );
      })
      .catch((err) => console.warn("[SW] Registration failed:", err));
  });
}
