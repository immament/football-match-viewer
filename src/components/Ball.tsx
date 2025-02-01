import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { ForwardedRef, forwardRef, useEffect, useRef, useState } from "react";
import { AnimationAction, AnimationMixer, Mesh, Vector3 } from "three";
import {
  selectMatchData,
  selectPaused,
  selectPlaybackSpeed,
  selectStartTime,
} from "../features/match/match.slice";
import { useMediaPlayerZuStore } from "../features/match/match.zu.slice";
import { createBallPositionAnimation } from "./createBallPositionAnimation";
import { useAppSelector } from "/app/withTypes";

export const BALL_RADIUS = 0.2;

type BallProps = unknown;

export const Ball = forwardRef<Mesh, BallProps>(
  (_: BallProps, ref: ForwardedRef<Mesh>) => {
    const ballRef = useRef<Mesh | null>(null);
    const texture = useTexture("models/ball.jpg");
    const updateMediaPlayerTime = useMediaPlayerZuStore(
      (state) => state.updateTime
    );

    const [positionAnimation, setPositionAnimation] =
      useState<AnimationAction>();

    const matchData = useAppSelector(selectMatchData);
    const matchPaused = useAppSelector(selectPaused);
    const startTime = useAppSelector(selectStartTime);
    const playbackSpeed = useAppSelector(selectPlaybackSpeed);

    const [mixer, setMixer] = useState<AnimationMixer>();

    useEffect(() => {
      if (mixer) {
        mixer.setTime(startTime / mixer.timeScale);
        updateMediaPlayerTime(Math.floor(mixer.time));
      }
    }, [mixer, startTime, updateMediaPlayerTime]);

    useEffect(() => {
      if (matchData?.positions.ball && ballRef.current) {
        const _mixer = new AnimationMixer(ballRef.current);
        const { positionAction } = createBallPositionAnimation(
          _mixer,
          matchData?.positions.ball
        );
        positionAction.play();
        setMixer(_mixer);
        setPositionAnimation(positionAction);
      }
    }, [matchData, ballRef]);

    useEffect(() => {
      if (mixer) mixer.timeScale = playbackSpeed;
    }, [mixer, playbackSpeed]);

    const [prevDelta, setPrevDelta] = useState(0);
    const _prevPosition = useRef<Vector3>(new Vector3(0, 0, 0));

    useFrame((_, delta) => {
      if (matchPaused) return;

      if (mixer && positionAnimation) {
        mixer.update(delta);

        if (prevDelta && ballRef.current) {
          // ball rotation (calculated for previous movement)
          ballRef.current.rotation.x +=
            (ballRef.current.position.z - _prevPosition.current.z) *
            60 *
            prevDelta;
          ballRef.current.rotation.z +=
            (_prevPosition.current.x - ballRef.current.position.x) *
            60 *
            prevDelta;
          _prevPosition.current.copy(ballRef.current.position);
        }
        setPrevDelta(delta);

        updateMediaPlayerTime(Math.floor(mixer.time));
        // dispatch(updateTimeThunk(Math.floor(mixer.time)));
      }
    });

    return (
      <mesh
        ref={(node) => {
          ballRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
      >
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    );
  }
);
