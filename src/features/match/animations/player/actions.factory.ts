import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  LoopOnce,
  QuaternionKeyframeTrack,
  VectorKeyframeTrack,
} from "three";
import { PlayerMovement } from "../playerMovement/calculataPlayerMovement";

export function createPlayerMoveActions(
  mixer: AnimationMixer,
  { times, positions, rotateValues }: PlayerMovement
): {
  positionAction: AnimationAction;
  rotateAction: AnimationAction;
  // poses: PoseRecord[];
} {
  const positionAction = createPlayerPositionAction(mixer, times, positions);
  const rotateAction = createPlayerRotateAnimationAction(
    mixer,
    times,
    rotateValues
  );

  return { positionAction, rotateAction };
}

function createPlayerPositionAction(
  mixer: AnimationMixer,
  times: number[],
  positions: number[]
): AnimationAction {
  const positionKF = new VectorKeyframeTrack(".position", times, positions);

  const positionClip = new AnimationClip("position", -1, [positionKF]);
  const positionAction = mixer.clipAction(positionClip);

  positionAction.loop = LoopOnce;
  positionAction.clampWhenFinished = true;
  return positionAction;
}

function createPlayerRotateAnimationAction(
  mixer: AnimationMixer,
  times: number[],
  rotateValues: number[]
) {
  const rotateKF = new QuaternionKeyframeTrack(
    ".quaternion",
    times,
    rotateValues
  );

  const rotateClip = new AnimationClip("rotate", -1, [rotateKF]);
  const rotateAction = mixer.clipAction(rotateClip);
  rotateAction.loop = LoopOnce;
  rotateAction.clampWhenFinished = true;
  return rotateAction;
}
