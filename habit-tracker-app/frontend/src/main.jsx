import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";

import App from "./App";
import "./styles.css";

// El DSN de un front no es secreto: solo sirve para ENVIAR datos, no para
// leerlos, y cualquier app web lo expone porque viaja en el JS que baja el
// navegador. Por eso puede ir escrito acá, a diferencia de una API key real.
Sentry.init({
  dsn: "https://ccc311321f6281aad34f3f3933a363a5@o4512279315742720.ingest.us.sentry.io/4512279336583168",
  environment: window.location.hostname, // de qué sitio vino: QA, producción o localhost
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
