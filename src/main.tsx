import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.tsx";
import "./index.scss";
import {
  ContainerContext,
  ContainerContextProps,
} from "/app/Container.context.ts";
import { logger } from "/app/logger.ts";
import { store } from "/app/store.ts";

main();

function main() {
  const urlParams = new URLSearchParams(window.location.search);
  const DEBUG_MODE = urlParams.has("dbg");
  const MEDIA_PLAYER_CONTAINER_ID = "root";

  if (DEBUG_MODE) {
    document.body.classList.add("debug");
  } else {
    logger.setLevel("INFO");
    logger.getLogger("player").setLevel("INFO");
  }

  const ctx: ContainerContextProps = {
    mediaPlayer: getContainer(MEDIA_PLAYER_CONTAINER_ID),
    debugMode: DEBUG_MODE,
  };

  createRoot(ctx.mediaPlayer).render(
    // <StrictMode>
    <Provider store={store}>
      <ContainerContext.Provider value={ctx}>
        <App />
      </ContainerContext.Provider>
    </Provider>
    // </StrictMode>
  );
}

function getContainer(elementId: string): HTMLElement {
  const container = document.getElementById(elementId);
  if (!container) {
    throw new Error(
      `Element with ID ${elementId} was not found in the document. Ensure there is a corresponding HTML element with the ID '${elementId}' in your HTML file.`
    );
  }
  return container;
}
