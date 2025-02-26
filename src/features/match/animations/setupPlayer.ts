import { AnimationAction, AnimationMixer, Object3D } from "three";
import { actionNames } from "../components/playerGltf.model";
import { PlayerId } from "../PlayerId";
import { createPlayerMoveActions } from "./actions.factory";
import { PlayerActions } from "./PlayerActions";
import { calculataPlayerMovement } from "./playerMovement/calculataPlayerMovement";
import { PlayerPoses } from "./PlayerPoses";
import { PoseTypes } from "./Pose.model";
import { PoseAction } from "./PoseAction";
import { IPoseAction, PoseRecord } from "./PoseAction.model";
import { MatchMovement } from "./positions.utils";
import { logger } from "/app/logger";

export type PlayerAnimationsConfig = {
  mixer: AnimationMixer;
  poses: PoseRecord[];
  playerPoses: PlayerPoses;
  actions: PlayerActions;
  rotateAction: AnimationAction;
  positionAction: AnimationAction;
};

export function setupPlayerAnimations(
  playerId: PlayerId,
  model: Object3D,
  matchMovement: MatchMovement,
  rawActions: Record<string, AnimationAction | null>
): PlayerAnimationsConfig {
  const mixer = new AnimationMixer(model);

  const playerMovements = calculataPlayerMovement(playerId, matchMovement);

  const { rotateAction, positionAction, poses } = createPlayerMoveActions(
    mixer,
    playerMovements
  );

  const poseActions = convertPoseActions(rawActions);

  const actions = new PlayerActions(
    positionAction,
    rotateAction,
    poseActions,
    playerId
  );

  const playerPoses = new PlayerPoses(playerId, mixer, actions, poses);

  return { mixer, poses, playerPoses, actions, rotateAction, positionAction };
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
