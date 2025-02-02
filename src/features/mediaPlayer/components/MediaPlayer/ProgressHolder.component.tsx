import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { formatTime } from "../../../match/formatTime";
import { gotoPercent, selectDuration } from "../../../match/match.slice";
import { useMediaPlayerZuStore } from "../../mediaPlayer.zu.slice";
import { debounce } from "/app/utils";
import { useAppDispatch, useAppSelector } from "/app/withTypes";

export function ProgressHolderComponent() {
  // const time = useAppSelector(selectTime);
  // const startTime = useAppSelector(selectStartTime);
  const duration = useAppSelector(selectDuration);
  const time = useMediaPlayerZuStore((state) => state.time);
  const displayTime = useMediaPlayerZuStore((state) => state.displayTime);
  // const displayTime = useAppSelector(selectTime);

  const dispatch = useAppDispatch();

  const playProgressRef = useRef<HTMLDivElement>(null);
  const timeTooltipRef = useRef<HTMLDivElement>(null);
  const progressHolderRef = useRef<HTMLDivElement>(null);
  // const progressControlRef = useRef<HTMLDivElement>(null);
  const hoverTooltipRef = useRef<HTMLDivElement>(null);

  const [hoverTooltip, setHoverTooltip] = useState<{
    x?: string;
    visibility: "visible" | "hidden";
    text?: string;
    offsetX?: string;
  }>({ visibility: "hidden" });

  const [timeTooltipOffsetX, setTimeTooltipOffsetX] = useState<string>();

  useLayoutEffect(() => {
    const offsetX = fixTooltipPosition2(hoverTooltipRef.current);
    if (offsetX === undefined) return;
    setHoverTooltip({
      ...hoverTooltip,
      offsetX: `${offsetX}px`,
    });
  }, [hoverTooltip, hoverTooltip.x]);

  const onProgressResize: ResizeObserverCallback = useCallback(() => {
    if (!timeTooltipRef.current) return;
    const offsetX = fixTooltipPosition2(timeTooltipRef.current);
    if (offsetX === undefined) return;
    setTimeTooltipOffsetX(`${offsetX}px`);
  }, []);

  const resizer = useMemo(() => {
    return new ResizeObserver(debounce(onProgressResize, 100));
  }, [onProgressResize]);

  useEffect(() => {
    if (playProgressRef.current) {
      resizer.observe(playProgressRef.current);
      return () => resizer.disconnect();
    }
  }, [resizer]);

  const progressControlClick: MouseEventHandler<HTMLDivElement> = (ev) => {
    dispatch(
      gotoPercent(ev.nativeEvent.offsetX / ev.currentTarget.offsetWidth)
    );
  };

  const onMouseMoveOverProgressControl = debounce(
    (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      // const tooltipParent = tooltipEl.offsetParent as HTMLElement;
      const progressWidth = progressHolderRef.current?.clientWidth;
      if (progressWidth) {
        const offsetX = ev.nativeEvent.offsetX;

        if (offsetX >= 0 && offsetX <= progressWidth) {
          const displayTime = percentToDisplayTime(offsetX / progressWidth);
          if (displayTime) {
            setHoverTooltip((state) => ({
              visibility: "visible",
              x: `${offsetX.toFixed()}px`,
              text: displayTime,
              offsetX: state.offsetX,
            }));
            return;
          }
        }
      }
      setHoverTooltip({ visibility: "hidden" });
    },
    100
  );

  const result = (
    <div className="mv-progress-line">
      <div className="mv-time">{displayTime}</div>
      <div
        className="mv-progress-control"
        onMouseMove={onMouseMoveOverProgressControl}
        onClick={progressControlClick}
      >
        <div className="mv-progress-holder" ref={progressHolderRef}>
          <div
            className="mv-play-progress"
            ref={playProgressRef}
            style={{ width: duration ? `${(time / duration) * 100}%` : 0 }}
          >
            <div
              className="mv-time-tooltip"
              ref={timeTooltipRef}
              style={{ right: timeTooltipOffsetX }}
            >
              {displayTime}
            </div>
          </div>
          <div className="mv-hover-display" style={{ left: hoverTooltip.x }}>
            <div
              className="mv-time-tooltip"
              aria-hidden="true"
              style={{
                visibility: hoverTooltip.visibility,
                right: hoverTooltip.offsetX,
              }}
              ref={hoverTooltipRef}
            >
              {hoverTooltip.text}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return result;

  function fixTooltipPosition2(
    tooltip: HTMLElement | null
  ): number | undefined {
    if (!tooltip?.checkVisibility({ visibilityProperty: true })) return;

    const tooltipEl = tooltip;

    const progress = tooltip.offsetParent as HTMLElement;
    const holder = progress.offsetParent as HTMLElement;
    const tooltipHalf = tooltip.clientWidth / 2;

    const progressEnd = Math.max(
      progress.offsetLeft + progress.offsetWidth,
      progress.offsetLeft
    );

    // tooltip.style.right = `-${offset()}px`;
    const result = -offset();
    return result;

    function offset() {
      // left edge
      if (progressEnd < tooltipHalf + 4) {
        return tooltipEl.clientWidth - progressEnd + 4;
      }
      // right edge
      if (holder.clientWidth < tooltipHalf + progressEnd + 4) {
        return holder.clientWidth - progressEnd - 4;
      }
      return tooltipHalf;
    }
  }

  function percentToDisplayTime(value: number): string {
    return formatTime(value * duration);
  }
}
