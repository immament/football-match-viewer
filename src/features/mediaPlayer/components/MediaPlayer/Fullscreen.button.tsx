import { useContext, useEffect, useState } from "react";
import screenfull from "screenfull";
import { ContainerContext } from "/app/Container.context";

export function FullscreenButton() {
  const [state, setState] = useState(calculatesState(screenfull.isFullscreen));
  const ctx = useContext(ContainerContext);

  const fullscreenContainer = ctx?.mediaPlayer;

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
