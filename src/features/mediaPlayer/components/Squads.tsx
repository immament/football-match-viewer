import { useState } from "react";
import "./Squads.scss";

export function Squads(params: unknown) {
  const [alertIsShown, setAlertIsShown] = useState(false);
  return (
    <>
      <div className={"mv-squads" + (alertIsShown ? " alert-is-shown" : "")}>
        <div className="mv-content">Squads</div>
      </div>
      <button
        onClick={() => {
          setAlertIsShown((state) => !state);
        }}
      >
        toogle
      </button>
    </>
  );
}
