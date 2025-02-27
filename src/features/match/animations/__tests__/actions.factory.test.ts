import {
  AnimationMixer,
  LoopOnce,
  Object3D,
  QuaternionKeyframeTrack,
  VectorKeyframeTrack,
} from "three";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPlayerMoveActions } from "../player/actions.factory";
import { PlayerMovement } from "../playerMovement/calculataPlayerMovement";

vi.mock("three");

describe("actions factory", () => {
  let _mixer: AnimationMixer;
  // const _playerId: PlayerId = { teamIdx: 0, playerIdx: 1 };
  // let positionsConfig: MatchMovement;
  let playerMovement: PlayerMovement;

  beforeEach(() => {
    _mixer = new AnimationMixer({} as Object3D);
    // positionsConfig = {
    //   ball: getBallPositions(),
    //   players: [getHomePlayers(), getAwayPlayers()],
    //   poses: getAllPlayerPoses(),
    // };
    playerMovement = {
      times: [0, 0.5, 1, 1.5, 2],
      positions: [0, 0, 0, 1, 0, 2, 1, 0, 2, -2, 0, 5, -2, 0, 5],
      rotateValues: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      poses: [],
    };
  });

  // {
  //     times: number[];
  //     positions: number[];
  //     rotateValues: number[];
  //     poses: PoseRecord[];
  //   }

  test("should create move actions", () => {
    const { positionAction, rotateAction } = createPlayerMoveActions(
      _mixer,
      playerMovement
    );

    expect(positionAction).toBeTruthy();
    expect(rotateAction).toBeTruthy();
  });

  test("should create position action with default values", () => {
    const { positionAction } = createPlayerMoveActions(_mixer, playerMovement);

    expect(positionAction.loop).toBe(LoopOnce);
    expect(positionAction.clampWhenFinished).toBe(true);
  });

  test("should create position action with correct keyframes", () => {
    const { positionAction } = createPlayerMoveActions(_mixer, playerMovement);

    const positionKF = positionAction
      .getClip()
      .tracks.find(
        (track) => track instanceof VectorKeyframeTrack
      ) as VectorKeyframeTrack;
    expect(positionKF).toBeTruthy();
    expect(positionKF.name).toBe(".position");
    expect(positionKF.times.length).greaterThan(0);
    expect(positionKF.values.length).greaterThan(0);
  });

  test("should create rotate action with correct keyframes", () => {
    const { rotateAction } = createPlayerMoveActions(_mixer, playerMovement);

    const rotateKF = rotateAction
      .getClip()
      .tracks.find(
        (track) => track instanceof QuaternionKeyframeTrack
      ) as QuaternionKeyframeTrack;
    expect(rotateKF).toBeTruthy();
    expect(rotateKF.name).toBe(".quaternion");
    expect(rotateKF.times.length).greaterThan(0);
    expect(rotateKF.values.length).greaterThan(0);
  });
});
