import { useMemo, useState } from "react";
import { PopupMenu, PopupMenuItem } from "./PopupMenu";
import { useAppZuStore } from "/app/app.zu.store";

export function PlaybackSpeedButton() {
  const playbackSpeed = useAppZuStore(
    (state) => state.mediaPlayer.playbackSpeed
  );
  const changePlaybackSpeed = useAppZuStore(
    (state) => state.mediaPlayer.changePlaybackSpeed
  );

  const [popupMenuVisible, setPopupMenuVisible] = useState(false);

  const labelText = useMemo(() => {
    return playbackSpeed !== 1 ? `x${playbackSpeed}` : "";
  }, [playbackSpeed]);

  const items: PopupMenuItem<number>[] = useMemo(
    () =>
      [
        { title: "Normal", value: 1 },
        { title: "x2", value: 2 },
        { title: "x4", value: 4 },
        { title: "x8", value: 8 },
      ] as const,
    []
  );

  const onButtonClick: React.MouseEventHandler<HTMLButtonElement> = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    setPopupMenuVisible(true);
  };

  function onPopupMenuBlur(): void {
    setPopupMenuVisible(false);
  }

  function onPopupMenuClicked(value: number): void {
    const speed = Number(value);
    if (speed > 0) {
      changePlaybackSpeed(speed);
    }

    setPopupMenuVisible(false);
  }

  return (
    <button
      className="mv-speed-control mv-with-label"
      onClick={onButtonClick}
      title="Playback Speed"
    >
      <i className={"bx bx-timer"}></i>
      <span>{labelText}</span>
      <PopupMenu
        title="Playback Speed"
        items={items}
        visible={popupMenuVisible}
        onBlur={onPopupMenuBlur}
        onItemSelected={onPopupMenuClicked}
        currentValue={playbackSpeed}
      />
    </button>
  );
}
