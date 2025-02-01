import { useMemo } from "react";
import { selectPaused, tooglePlay } from "../match.slice";
import { useAppDispatch, useAppSelector } from "/app/withTypes";

export function TooglePlayButton() {
  const paused = useAppSelector(selectPaused);
  const dispatch = useAppDispatch();

  const iconCss = useMemo(() => {
    return paused ? "bx bx-play" : "bx bx-pause";
  }, [paused]);

  const onClick = () => {
    dispatch(tooglePlay());
  };

  return (
    <button className="mv-play-control" onClick={onClick} title="Play">
      <i className={iconCss}></i>
    </button>
  );
}
