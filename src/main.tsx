import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./app/globals.css";

import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/inconsolata/400.css";
import "@fontsource/inconsolata/700.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
