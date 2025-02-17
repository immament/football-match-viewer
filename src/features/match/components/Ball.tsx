import { Billboard, Text, useTexture } from "@react-three/drei";
import { RootState } from "@react-three/fiber";
import {
  ForwardedRef,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimationAction, AnimationMixer, Mesh, Vector3 } from "three";
import { createBallPositionAnimation } from "../animations/createBallPositionAnimation";
import { useMatchDirector } from "./useMatchDirector";
import { useAppZuStore } from "/app/app.zu.store";
import { ContainerContext } from "/app/Container.context";
import { round } from "/app/utils";

export const BALL_RADIUS = 0.18;

type BallProps = unknown;

export const Ball = forwardRef<Mesh, BallProps>(
  (_: BallProps, ref: ForwardedRef<Mesh>) => {
    const ballRef = useRef<Mesh | null>(null);
    const texture = useTexture("models/ball.jpg");

    const [positionAnimation, setPositionAnimation] =
      useState<AnimationAction>();

    const matchData = useAppZuStore((state) => state.matchData.data);
    const matchPaused = useAppZuStore((state) => state.mediaPlayer.paused);
    const startTime = useAppZuStore((state) => state.mediaPlayer.startTime);
    const playbackSpeed = useAppZuStore(
      (state) => state.mediaPlayer.playbackSpeed
    );

    const [mixer, setMixer] = useState<AnimationMixer>();

    const ctx = useContext(ContainerContext);

    useEffect(() => {
      if (mixer && positionAnimation) {
        if (!mixer.timeScale) {
          throw new Error("Ball mixer.timeScale == 0");
        }
        positionAnimation.paused = false;
        mixer.setTime(startTime / mixer.timeScale);
      }
    }, [mixer, startTime, positionAnimation]);

    useEffect(() => {
      if (matchData?.positions.ball && ballRef.current && !positionAnimation) {
        const _mixer = new AnimationMixer(ballRef.current);
        const { positionAction } = createBallPositionAnimation(
          _mixer,
          matchData.positions.ball
        );
        positionAction.play();
        setMixer(_mixer);
        setPositionAnimation(positionAction);
      }
    }, [matchData, positionAnimation]);

    useEffect(() => {
      if (mixer) {
        mixer.timeScale = playbackSpeed;
      }
    }, [mixer, playbackSpeed]);

    const prevDelta = useRef(0);
    const prevPosition = useRef<Vector3>(new Vector3(0, 0, 0));

    const onFrameUpdate = useMemo(
      () => (_: RootState, delta: number) => {
        if (matchPaused) return;
        if (ballRef.current) animateBallRotation(delta, ballRef.current);

        function animateBallRotation(delta: number, ball: Mesh) {
          if (prevDelta) {
            ball.rotation.z -= rotation("x");
            ball.rotation.x += rotation("z");
            prevPosition.current.copy(ball.position);
          }
          prevDelta.current = delta;

          function rotation(axe: "x" | "z") {
            return Math.max(-0.2, Math.min(0.2, rawRotation(axe)));
          }

          function rawRotation(axe: "x" | "z") {
            return (
              (ball.position[axe] - prevPosition.current[axe]) *
              30 *
              prevDelta.current
            );
          }
        }
      },
      [matchPaused]
    );

    useMatchDirector(mixer, true, onFrameUpdate);

    return (
      <mesh
        ref={(node) => {
          ballRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        dispose={null}
      >
        {ctx?.debugMode && (
          <Billboard>
            <Text
              color="black"
              anchorX="center"
              anchorY="bottom"
              position={[0, 1, 0]}
              fontSize={0.3}
            >{`time: ${round(mixer?.time ?? 0, 1)}`}</Text>
          </Billboard>
        )}
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    );
  }
);
