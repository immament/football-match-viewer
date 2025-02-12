import { useMemo } from "react";
import "./mediaHeader.scss";
import { useAppZuStore } from "/app/app.zu.store";

export function MediaHeaderComponent() {
  const homeTeamName = useAppZuStore(({ teams }) => teams.teamsArray[0].name);

  const awayTeamName = useAppZuStore(({ teams }) => teams.teamsArray[1].name);
  const homeTeamGoals = useAppZuStore(({ teams }) => teams.teamsArray[0].goals);
  const awayTeamGoals = useAppZuStore(({ teams }) => teams.teamsArray[1].goals);
  const homeTeamColors = useAppZuStore(
    ({ teams }) => teams.teamsArray[0].colors
  );
  const awayTeamColors = useAppZuStore(
    ({ teams }) => teams.teamsArray[1].colors
  );
  const displayTime = useAppZuStore((state) => state.matchTimer.displayTime);

  const homeTeamStyle = useMemo(
    () => ({
      backgroundColor: homeTeamColors.shirt,
      color: homeTeamColors.text,
    }),
    [homeTeamColors.shirt, homeTeamColors.text]
  );
  const awayTeamStyle = useMemo(
    () => ({
      backgroundColor: awayTeamColors.shirt,
      color: awayTeamColors.text,
    }),
    [awayTeamColors.shirt, awayTeamColors.text]
  );

  return (
    <div className="mv-media-header">
      <div className="mv-content">
        <div></div>
        <div className="mv-team mv-team-1">
          <div className="mv-team-1 mv-box mv-team-name" style={homeTeamStyle}>
            <div>{homeTeamName ?? " "}</div>
          </div>
          <div className="mv-team-1 mv-box" style={homeTeamStyle}>
            {homeTeamGoals}
          </div>
        </div>
        <div className="mv-team mv-team-2">
          <div className="mv-team-2 mv-box" style={awayTeamStyle}>
            {awayTeamGoals}
          </div>
          <div className="mv-team-2 mv-box mv-team-name" style={awayTeamStyle}>
            <div>{awayTeamName ?? " "}</div>
          </div>
        </div>
        <div className="mv-time mv-box">{displayTime}</div>
      </div>
    </div>
  );
}
