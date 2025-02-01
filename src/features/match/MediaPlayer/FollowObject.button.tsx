import { ChangeEvent, useMemo, useState } from "react";
import {
  changeFollowedObjectId,
  changeViewFromObject,
  FOLLOW_BALL_IDX,
  selectFollowedObjectId,
  selectViewFromObject,
} from "../match.slice";
import { PopumMenuItem, PopupMenu } from "./PopupMenu";
import { useAppDispatch, useAppSelector } from "/app/withTypes";

export function FollowObjectButton() {
  const dispatch = useAppDispatch();
  const menuItems = useMemo(() => createMenuItems(), []);
  const followedObjectId = useAppSelector(selectFollowedObjectId);
  const viewFromObject = useAppSelector(selectViewFromObject);

  const [popupMenuVisible, setPopupMenuVisible] = useState(false);

  const { labelText, viewFromObjectStyle } = useMemo(() => {
    const selected = menuItems.find(({ value }) => value === followedObjectId);
    return {
      labelText: selected?.shortTitle ?? "",
      viewFromObjectStyle: {
        display: selected?.allowViewFromObject ? "block" : "none",
      },
    };
  }, [followedObjectId, menuItems]);

  const onButtonClick: React.MouseEventHandler<HTMLButtonElement> = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    setPopupMenuVisible(true);
  };

  function onPopupMenuBlur(): void {
    setPopupMenuVisible(false);
  }

  function onPopupMenuClicked(value: number): void {
    dispatch(changeFollowedObjectId(value));
    setPopupMenuVisible(false);
  }

  const onViewFromObjectChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const newValue = ev.currentTarget.checked;
    if (newValue !== viewFromObject) dispatch(changeViewFromObject(newValue));
  };

  return (
    <>
      <button
        className="mv-follow-control mv-with-label"
        onClick={onButtonClick}
        title="Follow"
      >
        <i className={"bx bx-camera-movie"}></i>
        <span>{labelText}</span>
        <PopupMenu
          title="Follow"
          items={menuItems}
          visible={popupMenuVisible}
          onBlur={onPopupMenuBlur}
          onItemSelected={onPopupMenuClicked}
          currentValue={followedObjectId}
        />
      </button>
      <input
        type="checkbox"
        title="View from object"
        style={viewFromObjectStyle}
        checked={viewFromObject}
        onChange={onViewFromObjectChange}
      />
    </>
  );

  function createMenuItems() {
    const items: (PopumMenuItem<number> & {
      shortTitle: string;
      allowViewFromObject?: boolean;
    })[] = [];

    initPlayerItems();

    items.push(
      { title: "None", value: 0, shortTitle: "" },
      {
        title: "Ball",
        value: FOLLOW_BALL_IDX,
        shortTitle: "ball",
        selected: true,
        allowViewFromObject: true,
      }
    );

    return items;

    function initPlayerItems() {
      for (let pl = 1; pl <= 22; pl++) {
        items.push({
          title: "Player " + pl,
          value: pl,
          shortTitle: pl.toString(),
          allowViewFromObject: true,
        });
      }
    }
  }
}
