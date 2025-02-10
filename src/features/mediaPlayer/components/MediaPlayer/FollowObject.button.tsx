import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { MatchPlayer } from "../../../match/MatchData.model";
import { PopupMenu, PopupMenuLink, PopupMenuSeparator } from "./PopupMenu";
import { useAppZuStore } from "/app/app.zu.store";
import { FOLLOW_BALL_IDX } from "/app/Camera.slice";

type FollowObjectMenuLink = PopupMenuLink<number> & {
  shortTitle: string;
  allowViewFromObject?: boolean;
};

type FollowObjectMenuItem = FollowObjectMenuLink | PopupMenuSeparator;

export function FollowObjectButton() {
  const [menuItems, setMenuItems] = useState<FollowObjectMenuItem[]>();

  const followedObjectId = useAppZuStore((st) => st.camera.followedObjectId);
  const viewFromObject = useAppZuStore((state) => state.camera.viewFromObject);
  const homeTeamSquadPlayers = useAppZuStore(
    (st) => st.teams.homeTeam.squadPlayers
  );
  const awayTeamSquadPlayers = useAppZuStore(
    (st) => st.teams.awayTeam.squadPlayers
  );
  const changeFollowedObjectId = useAppZuStore(
    (st) => st.camera.changeFollowedObjectId
  );
  const changeViewFromObject = useAppZuStore(
    (st) => st.camera.changeViewFromObject
  );

  useEffect(() => {
    setMenuItems(createMenuItems(homeTeamSquadPlayers, awayTeamSquadPlayers));
  }, [homeTeamSquadPlayers, awayTeamSquadPlayers]);

  const [popupMenuVisible, setPopupMenuVisible] = useState(false);

  const { labelText, viewFromObjectStyle } = useMemo(() => {
    const selected = menuItems?.find(
      (item) => !item.type && item.value === followedObjectId
    ) as FollowObjectMenuLink;
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
    changeFollowedObjectId(value);
    setPopupMenuVisible(false);
  }

  const onViewFromObjectChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const newValue = ev.currentTarget.checked;
    if (newValue !== viewFromObject) changeViewFromObject(newValue);
  };

  if (!menuItems) return null;
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

  function createMenuItems(
    homePlayers: MatchPlayer[],
    awayPlayers: MatchPlayer[]
  ) {
    const items: FollowObjectMenuItem[] = [
      ...initPlayerItems(homePlayers, 1),
      { type: "separator" },
      ...initPlayerItems(awayPlayers, 12),
      { type: "separator" },
      { title: "None", value: 0, shortTitle: "" },
      {
        title: "Ball",
        value: FOLLOW_BALL_IDX,
        shortTitle: "ball",
        selected: true,
        allowViewFromObject: true,
      },
    ];

    return items;

    function initPlayerItems(players: MatchPlayer[], startIdx: number) {
      return players.map((pl, index) => ({
        title: `${pl.shirtNumber}. ${pl.name}`,
        value: startIdx + index,
        shortTitle: pl.shirtNumber,
        allowViewFromObject: true,
      }));
    }
  }
}
