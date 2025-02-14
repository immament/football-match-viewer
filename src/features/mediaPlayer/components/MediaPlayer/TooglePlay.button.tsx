import { useMemo } from "react";
import { useAppZuStore } from "/app/app.zu.store";

export function TooglePlayButton() {
  const paused = useAppZuStore((state) => state.mediaPlayer.paused);
  const tooglePlay = useAppZuStore((state) => state.mediaPlayer.tooglePlay);

  const iconCss = useMemo(() => {
    return paused ? "bx bx-play" : "bx bx-pause";
  }, [paused]);

  const onClick = () => {
    tooglePlay();
  };

  return (
    <button className="mv-play-control" onClick={onClick} title="Play">
      <i className={iconCss}></i>
    </button>
  );
}
