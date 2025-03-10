import { useEffect, useState } from "react";
import { useAppZuStore } from "/app/app.zu.store";

export function EventInfoBox() {
  const eventToDisplay = useAppZuStore(
    (state) => state.matchTimer.eventToDisplay
  );

  const [visibility, setVisibility] = useState<"hidden" | "visible">("hidden");

  useEffect(() => {
    if (eventToDisplay) {
      setVisibility("visible");
      const timeout = setTimeout(() => setVisibility("hidden"), 4000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [eventToDisplay]);

  if (!eventToDisplay) return;
  return (
    <div className="mv-info-box" style={{ visibility }}>
      <div className="mv-info-box-header" style={eventToDisplay.style}>
        <div>{eventToDisplay.header}</div>
        <div className="mv-info-box-time">
          <div>{eventToDisplay.time}</div>
        </div>
      </div>
      <div className="mv-info-box-content">
        <div>
          <i className={eventToDisplay.iconCss} />
        </div>
        <div>{eventToDisplay.content}</div>
      </div>
    </div>
  );
}
