import { useEffect, useMemo, useState } from "react";
import screenfull from "screenfull";
import { useAppZuStore } from "/app/app.zu.store";

export function FullscreenButton() {
  const [state, setState] = useState(calculatesState(screenfull.isFullscreen));
  // const ctx = useContext(ContainerContext);

  const mediaPlayerContainerId = useAppZuStore(
    ({ mediaPlayer }) => mediaPlayer.mediaPlayerContainerId
  );

  const fullscreenContainer = useMemo(() => {
    return document.getElementById(mediaPlayerContainerId);
  }, [mediaPlayerContainerId]);

  useEffect(() => {
    if (screenfull.isEnabled) {
      screenfull.on("change", () => {
        setState(calculatesState(screenfull.isFullscreen));
      });
    }
  }, []);

  if (!screenfull.isEnabled || !fullscreenContainer) return <></>;

  return (
    <button
      className="mv-fullscreen-control"
      onClick={toogleFullscreen}
      title={state.title}
    >
      <i className={state.iconCss} />
    </button>
  );

  function calculatesState(isFullscreen: boolean) {
    return {
      iconCss: isFullscreen ? "bx bx-exit-fullscreen" : "bx bx-fullscreen",
      title: isFullscreen ? "Exit Fullscreen" : "Fullscreen",
    };
  }

  function toogleFullscreen(): void {
    if (!screenfull.isEnabled || !fullscreenContainer) return;
    screenfull.toggle(fullscreenContainer);
  }
}
