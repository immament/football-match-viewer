import { RootState, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { AnimationMixer } from "three";
import { mixerDeltaTime } from "../animations/positions.utils";
import { useAppZuStore } from "/app/app.zu.store";

export function useMatchDirector(
  mixer: AnimationMixer | undefined,
  isMain = false,
  onFrame?: (state: RootState, delta: number) => void
) {
  const liveTime = useRef<number>();
  useEffect(
    () =>
      useAppZuStore.subscribe(
        ({ matchTimer }) => (liveTime.current = matchTimer.liveMatch?.liveTime)
      ),
    []
  );

  const matchPaused = useAppZuStore((state) => state.mediaPlayer.paused);
  const matchDuration = useAppZuStore(
    (state) => state.mediaPlayer.totalDuration
  );

  const pauseMatch = useAppZuStore((state) => state.mediaPlayer.pause);
  const changePlaybackSpeed = useAppZuStore(
    (state) => state.mediaPlayer.changePlaybackSpeed
  );
  const updateStep = useAppZuStore((state) => state.matchTimer.updateStep);

  useFrame((state, aDelta) => {
    if (!mixer) return;

    const {
      delta: deltaTime,
      isEnd,
      aboveLiveTime,
    } = mixerDeltaTime(
      aDelta,
      mixer.time,
      matchPaused,
      matchDuration,
      liveTime.current,
      mixer.timeScale
    );
    if (isMain) {
      if (!deltaTime && isEnd) {
        pauseMatch();
      }
      if (aboveLiveTime) {
        changePlaybackSpeed(1);
      }
      updateStep(mixer.time);
    }
    if (aboveLiveTime) {
      mixer.timeScale = 1;
    }
    mixer.update(deltaTime);
    if (onFrame) onFrame(state, deltaTime);
  });
}
