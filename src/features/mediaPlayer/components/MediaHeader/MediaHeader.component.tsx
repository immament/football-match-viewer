import {
  selectAwayGoals,
  selectAwayTeamName,
  selectHomeGoals,
  selectHomeTeamName,
} from "../../../match/match.slice";
import { useMediaPlayerZuStore } from "../../mediaPlayer.zu.slice";
import "./mediaHeader.scss";
import { useAppSelector } from "/app/withTypes";

export function MediaHeaderComponent() {
  const homeTeamName = useAppSelector(selectHomeTeamName);
  const awayTeamName = useAppSelector(selectAwayTeamName);
  const homeTeamGoals = useAppSelector(selectHomeGoals);
  const awayTeamGoals = useAppSelector(selectAwayGoals);
  const displayTime = useMediaPlayerZuStore((state) => state.displayTime);

  return (
    <div className="mv-media-header">
      <div className="mv-content">
        <div></div>
        <div className="mv-team mv-team-1">
          <div className="mv-team-1 mv-box mv-team-name">
            <div>{homeTeamName ?? " "}</div>
          </div>
          <div className="mv-team-1 mv-box">{homeTeamGoals}</div>
        </div>
        <div className="mv-team mv-team-2">
          <div className="mv-team-2 mv-box">{awayTeamGoals}</div>
          <div className="mv-team-2 mv-box mv-team-name">
            <div>{awayTeamName ?? " "}</div>
          </div>
        </div>
        <div className="mv-time mv-box">{displayTime}</div>
      </div>
    </div>
  );
}
