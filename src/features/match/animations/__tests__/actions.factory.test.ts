import {
  AnimationMixer,
  LoopOnce,
  Object3D,
  QuaternionKeyframeTrack,
  VectorKeyframeTrack,
} from "three";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { PlayerId } from "../../PlayerId";
import { createMoveActions } from "../actions.factory";
import { MatchMovement } from "../positions.utils";
import { getPlayers as getAwayPlayers } from "./__testData__/awayPlayersPosition.big.mock";
import { getBallPositions } from "./__testData__/ball.mock";
import { getPlayers as getHomePlayers } from "./__testData__/homePlayersPosition.big.mock";
import { getAllPlayerPoses } from "./__testData__/playersPose.mock";

vi.mock("three");

describe("actions factory", () => {
  let _mixer: AnimationMixer;
  const _playerId: PlayerId = { teamIdx: 0, playerIdx: 1 };
  let positionsConfig: MatchMovement;

  beforeEach(() => {
    _mixer = new AnimationMixer({} as Object3D);
    positionsConfig = {
      ball: getBallPositions(),
      players: [getHomePlayers(), getAwayPlayers()],
      poses: getAllPlayerPoses(),
    };
  });

  test("should create move actions", () => {
    const { positionAction, rotateAction, poses } = createMoveActions(
      _mixer,
      _playerId,
      positionsConfig
    );

    expect(positionAction).toBeTruthy();
    expect(rotateAction).toBeTruthy();
    expect(poses).toBeTruthy();
  });

  test("should create position action with default values", () => {
    const { positionAction } = createMoveActions(
      _mixer,
      _playerId,
      positionsConfig
    );

    expect(positionAction.loop).toBe(LoopOnce);
    expect(positionAction.clampWhenFinished).toBe(true);
  });

  test("should create position action with correct keyframes", () => {
    const { positionAction } = createMoveActions(
      _mixer,
      _playerId,
      positionsConfig
    );

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
    const { rotateAction } = createMoveActions(
      _mixer,
      _playerId,
      positionsConfig
    );

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
