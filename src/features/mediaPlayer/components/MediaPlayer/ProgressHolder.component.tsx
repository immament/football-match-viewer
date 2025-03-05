import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { formatTime } from "../../../match/formatTime";
import { useAppZuStore } from "/app/app.zu.store";
import { debounce } from "/app/utils";
import { MatchBestMoment } from "/src/features/match/MatchData.model";

type BestMoment = { start: string; duration: string };

export function ProgressHolderComponent() {
  const duration = useAppZuStore((state) => state.mediaPlayer.duration);
  const time = useAppZuStore((state) => state.matchTimer.time);
  const displayTime = useAppZuStore((state) => state.matchTimer.displayTime);
  const liveTime = useAppZuStore(
    (state) => state.matchTimer.liveMatch?.liveTime ?? -1
  );
  const gotoPercent = useAppZuStore((state) => state.mediaPlayer.gotoPercent);
  const bestMomentsRaw = useAppZuStore(
    ({ matchData }) => matchData.data?.bestMoments
  );

  const bestMoments: BestMoment[] | undefined = useMemo(() => {
    if (!bestMomentsRaw || !duration) return;
    return bestMomentsToView(bestMomentsRaw, duration, liveTime);
  }, [bestMomentsRaw, duration, liveTime]);

  const playProgressRef = useRef<HTMLDivElement>(null);
  const timeTooltipRef = useRef<HTMLDivElement>(null);
  const progressHolderRef = useRef<HTMLDivElement>(null);
  const hoverTooltipRef = useRef<HTMLDivElement>(null);

  const [hoverTooltip, setHoverTooltip] = useState<{
    x?: string;
    visibility: "visible" | "hidden";
    text?: string;
  }>({ visibility: "hidden" });

  // const [timeTooltipOffsetX, setTimeTooltipOffsetX] = useState<string>();

  useLayoutEffect(() => {
    if (!hoverTooltipRef.current) return;
    const offsetX = fixTooltipPosition2(hoverTooltipRef.current);
    hoverTooltipRef.current.style.right = `${offsetX}px`;
    // if (offsetX) setHoverTooltipOffsetX(`${offsetX}px`);
  }, [hoverTooltip.x]);

  const onProgressResize: ResizeObserverCallback = useCallback(() => {
    if (!timeTooltipRef.current) return;
    const offsetX = fixTooltipPosition2(timeTooltipRef.current);
    if (offsetX === undefined) return;
    timeTooltipRef.current.style.right = `${offsetX}px`;
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
    gotoPercent((ev.nativeEvent.offsetX / ev.currentTarget.offsetWidth) * 100);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onMouseMoveOverProgressControl = useCallback(
    debounce(
      (
        ev: React.MouseEvent<HTMLDivElement, MouseEvent>,
        aLiveTime: number,
        aDuration: number
      ): void => {
        if (!hoverTooltipRef.current?.parentElement) return;
        const progressWidth = progressHolderRef.current?.clientWidth;
        if (progressWidth) {
          const offsetX = ev.nativeEvent.offsetX;

          if (offsetX >= 0 && offsetX <= progressWidth) {
            const hoverTime = (offsetX / progressWidth) * aDuration;
            if (aLiveTime > 0 && hoverTime > aLiveTime) {
              hoverTooltipRef.current.style.visibility = "hidden";
              return;
            }
            const displayTime = formatTime(hoverTime);
            if (displayTime) {
              hoverTooltipRef.current.style.visibility = "visible";
              hoverTooltipRef.current.parentElement.style.left = `${offsetX.toFixed()}px`;
              hoverTooltipRef.current.textContent = displayTime;
              return;
            }
          }
        }
        setHoverTooltip({ visibility: "hidden" });
        hoverTooltipRef.current.style.visibility = "hidden";
      },
      100
    ),
    []
  );

  const result = (
    <div className="mv-progress-line">
      <div className="mv-time">{displayTime}</div>
      <div
        className="mv-progress-control"
        onMouseMove={(ev) =>
          onMouseMoveOverProgressControl(ev, liveTime, duration)
        }
        onClick={progressControlClick}
      >
        <div className="mv-progress-holder" ref={progressHolderRef}>
          {bestMoments && <BestMoments bestMoments={bestMoments} />}

          <div
            className="mv-play-progress"
            ref={playProgressRef}
            style={{ width: duration ? `${(time / duration) * 100}%` : 0 }}
          >
            <div className="mv-time-tooltip" ref={timeTooltipRef}>
              {displayTime}
            </div>
          </div>
          <div className="mv-hover-display">
            <div
              className="mv-time-tooltip"
              aria-hidden="true"
              ref={hoverTooltipRef}
            >
              {hoverTooltip.text}
            </div>
          </div>
          {liveTime > 0 && duration > 0 && (
            <div
              className="mv-live-time"
              style={{ left: `${(liveTime / duration) * 100}%` }}
            >
              <div
                className="mv-time-tooltip"
                aria-hidden="true"
                style={{ transform: "translateX(-50%)" }}
              >
                {formatTime(liveTime)}
              </div>
            </div>
          )}
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
}

function BestMoments({ bestMoments }: { bestMoments: BestMoment[] }) {
  return bestMoments.map((bm, index) => (
    <div
      className="mv-best-moment"
      key={`bm-${index}`}
      style={{
        width: bm.duration,
        left: bm.start,
        position: "absolute",
      }}
    />
  ));
}

function bestMomentsToView(
  bestMomentsRaw: MatchBestMoment[],
  duration: number,
  liveTime: number
): { start: string; duration: string }[] | undefined {
  return bestMomentsRaw
    ?.filter(
      (bm) =>
        bm.startTime < duration && (liveTime < 0 || bm.startTime < liveTime)
    )
    .map((bm) => ({
      start: ((bm.startTime / duration) * 100).toFixed(2) + "%",
      duration:
        (((bm.endTime - bm.startTime) / duration) * 100).toFixed(2) + "%",
    }));
}
