import { useAppZuStore } from "./app/app.zu.store";
import { logger } from "./app/logger";

export function initDev() {
  const urlParams = new URLSearchParams(window.location.search);
  const isDebug = urlParams.has("dbg");
  const liveTime = urlParams.has("lt")
    ? Number(urlParams.get("lt"))
    : undefined;

  useAppZuStore.setState(({ debug }) => {
    debug.isDebug = isDebug;
    debug.liveTime = liveTime;
  });

  if (isDebug) {
    document.body.classList.add("debug");
  } else {
    logger.setLevel("INFO");
    logger.getLogger("player").setLevel("INFO");
  }

  return { isDebug };
}
