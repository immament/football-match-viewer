import "./mediaHeader.scss";
import { useAppZuStore } from "/app/app.zu.store";

export function MediaHeaderComponent() {
  const homeTeamName = useAppZuStore(({ teams }) => teams.homeTeam.name);
  const awayTeamName = useAppZuStore(({ teams }) => teams.awayTeam.name);
  const homeTeamGoals = useAppZuStore(({ teams }) => teams.homeTeam.goals);
  const awayTeamGoals = useAppZuStore(({ teams }) => teams.awayTeam.goals);
  const displayTime = useAppZuStore((state) => state.displayTime);

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
