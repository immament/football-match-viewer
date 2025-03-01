import { useMemo, useState } from "react";
import { DisplayMoments } from "../../MediaPlayer.slice";
import { PopupMenu, PopupMenuLink } from "./PopupMenu";
import { useAppZuStore } from "/app/app.zu.store";

export function DisplayMomentsButton() {
  const displayMoments = useAppZuStore(
    (state) => state.mediaPlayer.displayMoments
  );
  const changeDisplayMoments = useAppZuStore(
    (state) => state.mediaPlayer.changeDisplayMoments
  );

  const [popupMenuVisible, setPopupMenuVisible] = useState(false);

  const items: PopupMenuLink<string>[] = useMemo(
    () =>
      [
        { title: "Show All", value: "all" },
        { title: "Best Moments", value: "best" },
        // { title: "Only Goals", value: "goals" },
      ] as const,
    []
  );

  const labelText = useMemo(() => {
    return items.find((item) => item.value === displayMoments)?.title ?? "";
  }, [displayMoments, items]);

  const onButtonClick: React.MouseEventHandler<HTMLButtonElement> = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    setPopupMenuVisible(true);
  };

  function onPopupMenuBlur(): void {
    setPopupMenuVisible(false);
  }

  function onPopupMenuClicked(value: string): void {
    changeDisplayMoments(value as DisplayMoments);
    setPopupMenuVisible(false);
  }

  return (
    <button
      className="mv-speed-control mv-with-label"
      onClick={onButtonClick}
      title="Display moments"
    >
      <span>{labelText}</span>
      <PopupMenu
        items={items}
        visible={popupMenuVisible}
        onBlur={onPopupMenuBlur}
        onItemSelected={onPopupMenuClicked}
        currentValue={displayMoments}
      />
    </button>
  );
}
