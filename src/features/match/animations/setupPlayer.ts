import { AnimationAction, AnimationMixer, Object3D } from "three";
import { actionNames } from "../playerGltf.model";
import { PlayerId } from "../PlayerId";
import { createMoveActions } from "./actions.factory";
import { PlayerActions } from "./PlayerActions";
import { PlayerPoses } from "./PlayerPoses";
import { PoseTypes } from "./Pose.model";
import { PoseAction } from "./PoseAction";
import { IPoseAction } from "./PoseAction.model";
import { MatchMovement } from "./positions.utils";
import { logger } from "/app/logger";

export function setupPlayerAnimations(
  playerId: PlayerId,
  model: Object3D,
  positionsConfig: MatchMovement,
  rawActions: Record<string, AnimationAction | null>
) {
  const mixer = new AnimationMixer(model);

  const { rotateAction, positionAction, poses } = createMoveActions(
    mixer,
    playerId,
    positionsConfig
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

  // ++ internal ++

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
}
