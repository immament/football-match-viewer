import { useState } from "react";
import "./Squads.scss";

export function Squads() {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <>
      <div
        className={
          "mv-squads stripe-1" + (isVisible ? " mv-squads-visible" : "")
        }
      >
        <div>Friendly Match - Week 3</div>
        <div className="mv-squad-teams">
          <div className="mv-squad-team">
            <div className="mv-squad-team-name">Team A</div>
            <div className="mv-squad-field"></div>
          </div>
          <div className="mv-squad-team">
            <div className="mv-squad-team-name">Team B</div>
            <div className="mv-squad-field">
              <div className="mr-position-container">
                <div className="mr-position pointer ">
                  <div className="mr-shirt" style={{ backgroundColor: "blue" }}>
                    <img src="images/shirt-details.png" />
                    <div className="mr-shirt-number" style={{ color: "white" }}>
                      {"2"}
                    </div>
                  </div>
                  <div className="mr-player-name badge">
                    <a
                      href="https://www.footstar.org/player/ver_jogador.asp?jog_id=159074"
                      target="_blank"
                    >
                      {"Dave Edwards"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={() => setIsVisible((state) => !state)}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        toogle
      </button>
    </>
  );
}
