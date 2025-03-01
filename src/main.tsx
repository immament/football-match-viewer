import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

import { initDev } from "./dev.ts";
import "./index.scss";

main();

function main() {
  initDev();
  const MEDIA_PLAYER_CONTAINER_ID = "root";

  const mediaPlayerElem = getContainer(MEDIA_PLAYER_CONTAINER_ID);

  createRoot(mediaPlayerElem).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

function getContainer(elementId: string): HTMLElement {
  const container = document.getElementById(elementId);
  if (!container) {
    throw new Error(
      `Element with ID ${elementId} was not found in the document. 
      Ensure there is a corresponding HTML element with the ID '${elementId}' in your HTML file.`
    );
  }
  return container;
}

// async function enableMocking() {
//   return;
//   if (import.meta.env.PROD) return;
//   const { worker } = await import("./mocks/browser.ts");
//   return worker.start();
// }
