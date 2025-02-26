import { Billboard, Text, useTexture } from "@react-three/drei";
import { RootState } from "@react-three/fiber";
import { useControls } from "leva";
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
import {
  BallStates,
  createBallPositionAnimation,
} from "../animations/createBallPositionAnimation";
import { secondsToStep } from "../animations/positions.utils";
import { useMatchDirector } from "./useMatchDirector";
import { useAppZuStore } from "/app/app.zu.store";
import { ContainerContext } from "/app/Container.context";

export const BALL_RADIUS = 0.18;

type BallProps = unknown;

export const Ball = forwardRef<Mesh, BallProps>(
  (_: BallProps, ref: ForwardedRef<Mesh>) => {
    const ballRef = useRef<Mesh | null>(null);
    const dbgLabelRef = useRef<{ text: string }>(null);

    const texture = useTexture("models/ball.jpg");

    const positionAnimationRef = useRef<AnimationAction>();
    const ballStatesRef = useRef<BallStates>();

    const ballPositions = useAppZuStore(
      (state) => state.matchData.data?.positions.ball
    );
    const matchPaused = useAppZuStore((state) => state.mediaPlayer.paused);
    const startTime = useAppZuStore((state) => state.mediaPlayer.startTime);
    const playbackSpeed = useAppZuStore(
      (state) => state.mediaPlayer.playbackSpeed
    );

    const [mixer, setMixer] = useState<AnimationMixer>();

    const ctx = useContext(ContainerContext);

    const controls = useControls("Ball", { labelVisible: true });

    useEffect(() => {
      if (mixer && positionAnimationRef.current) {
        if (!mixer.timeScale) {
          throw new Error("Ball mixer.timeScale == 0");
        }
        positionAnimationRef.current.paused = false;
        mixer.setTime(startTime / mixer.timeScale);
      }
    }, [mixer, startTime, positionAnimationRef]);

    useEffect(() => {
      if (ballPositions && ballRef.current && !positionAnimationRef.current) {
        const _mixer = new AnimationMixer(ballRef.current);
        const { positionAction, directions } = createBallPositionAnimation(
          _mixer,
          ballPositions
        );
        positionAction.play();
        setMixer(_mixer);
        positionAnimationRef.current = positionAction;
        ballStatesRef.current = directions;
      }
    }, [ballPositions, positionAnimationRef]);

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
          updateDbgLabel();
        }

        function updateDbgLabel() {
          if (dbgLabelRef.current) {
            const timeText = mixer?.time.toFixed(1);

            dbgLabelRef.current.text = `${
              balStats(ballStatesRef.current) ?? ""
            } ${timeText && `\ntime: ${timeText}`}`;
          }
        }

        function balStats(stats: BallStates | undefined) {
          if (!mixer?.time || !stats) return;
          const step = secondsToStep(mixer.time);
          const stepStats = stats[step];
          if (!stepStats) return;

          return `${step}: ${stepStats.angle.toFixed(
            1
          )} / ${stepStats.dAngle?.toFixed(1)} / ${stepStats.dist.toFixed(
            1
          )} / ${stepStats.dDist?.toFixed(1)}`;
        }
      },
      [matchPaused, mixer]
    );

    useMatchDirector(mixer, true, onFrameUpdate);

    return (
      <mesh
        ref={(node) => {
          ballRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        castShadow={true}
        dispose={null}
      >
        {ctx?.debugMode && controls.labelVisible && (
          <Billboard>
            <Text
              color="black"
              anchorX="center"
              anchorY="bottom"
              textAlign="center"
              position={[0, 1, 0]}
              fontSize={0.3}
              ref={dbgLabelRef}
            >
              {" "}
            </Text>
            {/* {`time: ${round(mixer?.time ?? 0, 1)}`} */}
          </Billboard>
        )}
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    );
  }
);
