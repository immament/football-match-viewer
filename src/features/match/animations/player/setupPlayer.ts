import { AnimationAction, AnimationMixer, Object3D } from "three";
import { actionNames } from "../../components/playerGltf.model";
import { PlayerId } from "../../PlayerId";
import { PlayerMovement } from "../playerMovement/calculataPlayerMovement";
import { secondsToStep } from "../positions.utils";
import { createPlayerMoveActions } from "./actions.factory";
import { PlayerActions } from "./PlayerActions";
import { PlayerPoses } from "./PlayerPoses";
import { PoseTypes } from "./Pose.model";
import { PoseAction } from "./PoseAction";
import { IPoseAction } from "./PoseAction.model";
import { logger } from "/app/logger";

export class PlayerAnimationsConfig {
  get get_mixer(): AnimationMixer {
    return this._mixer;
  }

  constructor(
    private _mixer: AnimationMixer,
    private _playerPoses: PlayerPoses,
    private _rotateAction: AnimationAction,
    private _positionAction: AnimationAction
  ) {}

  startMatch(startTime: number, playbackSpeed: number): void {
    this._playerPoses.forceIdle();
    this._positionAction.play();
    this._rotateAction.play();
    if (startTime) {
      this.gotoTime(startTime);
    }
    this.changePlaybackSpeed(playbackSpeed);
  }

  gotoTime(newTime: number): void {
    if (!this._mixer.timeScale) {
      throw new Error("Player config.mixer.timeScale == 0");
    }
    this._mixer.setTime(newTime / this._mixer.timeScale);
    this._playerPoses.forceUpdatePose = true;
    this.unpauseMoveActions();
  }

  changePlaybackSpeed(playbackSpeed: number): void {
    this._mixer.timeScale = playbackSpeed;
    this.unpauseMoveActions();
  }

  updatePose(delta: number) {
    return this._playerPoses.updatePose(delta);
  }

  time() {
    return this._mixer.time;
  }
  step() {
    return secondsToStep(this._mixer.time);
  }

  private unpauseMoveActions(): void {
    this._positionAction.paused = false;
    this._rotateAction.paused = false;
  }
}

export function setupPlayerAnimations(
  playerId: PlayerId,
  model: Object3D,
  rawActions: Record<string, AnimationAction | null>,
  playerMovements: PlayerMovement
): PlayerAnimationsConfig {
  const mixer = new AnimationMixer(model);

  // const _playerMovements2 = calculataPlayerMovement(playerId, matchMovement);

  const { rotateAction, positionAction } = createPlayerMoveActions(
    mixer,
    playerMovements
  );
  const poses = playerMovements.poses.map((pose) => ({ ...pose }));

  const poseActions = convertPoseActions(rawActions);

  const actions = new PlayerActions(
    positionAction,
    rotateAction,
    poseActions,
    playerId
  );

  const playerPoses = new PlayerPoses(playerId, mixer, actions, poses);

  return new PlayerAnimationsConfig(
    mixer,
    playerPoses,
    rotateAction,
    positionAction
  );
}

function convertPoseActions(
  rawActions: Record<string, AnimationAction | null>
) {
  const poseActions = {} as Record<PoseTypes, IPoseAction>;

  Object.keys(actionNames).forEach((key) => {
    const poseType = key as PoseTypes;
    const rawAction = rawActions[actionNames[poseType]];
    if (rawAction) {
      rawAction.setEffectiveWeight(0);
      rawAction.enabled = false;
      poseActions[poseType] = new PoseAction(true, poseType, rawAction);
    } else {
      logger.warn(`Player animation action ${poseType} not found!`);
    }
  });

  return poseActions;
}
