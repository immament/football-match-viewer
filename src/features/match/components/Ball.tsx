import { Billboard, Text, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  ForwardedRef,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimationAction, AnimationMixer, Mesh, Vector3 } from "three";
import { createBallPositionAnimation } from "../animations/createBallPositionAnimation";
import {
  selectMatchData,
  selectPaused,
  selectPlaybackSpeed,
  selectStartTime,
  updateMatchStepThunk,
} from "../match.slice";
import { ContainerContext } from "/app/Container.context";
import { round } from "/app/utils";
import { useAppDispatch, useAppSelector } from "/app/withTypes";

export const BALL_RADIUS = 0.18;

type BallProps = unknown;

export const Ball = forwardRef<Mesh, BallProps>(
  (_: BallProps, ref: ForwardedRef<Mesh>) => {
    const ballRef = useRef<Mesh | null>(null);
    const texture = useTexture("models/ball.jpg");
    // const updateStep = useMediaPlayerZuStore((state) => state.updateStep);
    const dispatch = useAppDispatch();

    const [positionAnimation, setPositionAnimation] =
      useState<AnimationAction>();

    const matchData = useAppSelector(selectMatchData);
    const matchPaused = useAppSelector(selectPaused);
    const startTime = useAppSelector(selectStartTime);
    const playbackSpeed = useAppSelector(selectPlaybackSpeed);

    const [mixer, setMixer] = useState<AnimationMixer>();

    const ctx = useContext(ContainerContext);

    useEffect(() => {
      if (mixer) {
        mixer.setTime(startTime / mixer.timeScale);
      }
    }, [mixer, startTime]);

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
    }, [matchData]);

    useEffect(() => {
      if (mixer) mixer.timeScale = playbackSpeed;
    }, [mixer, playbackSpeed]);

    const [prevDelta, setPrevDelta] = useState(0);
    const prevPosition = useRef<Vector3>(new Vector3(0, 0, 0));

    // const lastStep = useRef<number>(-1);

    useFrame((_, delta) => {
      if (matchPaused) return;

      if (mixer && positionAnimation) {
        mixer.update(delta);

        if (ballRef.current) animateBallRotation(delta, ballRef.current);
        dispatch(updateMatchStepThunk(mixer.time));
      }
    });
    // ball rotation (calculated for previous movement)
    function animateBallRotation(delta: number, ball: Mesh) {
      if (prevDelta) {
        ball.rotation.z -= rotation("x");
        ball.rotation.x += rotation("z");
        prevPosition.current.copy(ball.position);
      }
      setPrevDelta(delta);

      function rotation(axe: "x" | "z") {
        return Math.max(-0.2, Math.min(0.2, rawRotation(axe)));
      }

      function rawRotation(axe: "x" | "z") {
        return (
          (ball.position[axe] - prevPosition.current[axe]) * 30 * prevDelta
        );
      }
    }

    return (
      <>
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
      </>
    );
  }
);
