import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Object3D
} from "three";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { PlayerId } from "../../PlayerId";
import { PlayerActions } from "../PlayerActions";
import { PoseTypes } from "../Pose.model";
import { IPoseAction } from "../PoseAction.model";

vi.mock("three");
const PoseActionMock = vi.fn((isMove: boolean) => {
  return {
    isMove,
    play: vi.fn(),
    stop: vi.fn(),
    paused: true,
    setEffectiveWeight: vi.fn(),
    time: 0,
    enabled: true
  } as unknown as IPoseAction;
});

describe("PlayerActions", () => {
  const _playerId: PlayerId = { teamIdx: 0, playerIdx: 1 };
  let _positionAction: AnimationAction;
  let _rotateAction: AnimationAction;
  let _poseActions: Record<PoseTypes, IPoseAction>;

  beforeEach(() => {
    const mixer = new AnimationMixer(new Object3D());
    const clip = new AnimationClip("clip", 1);
    _positionAction = mixer.clipAction(clip);
    _rotateAction = mixer.clipAction(clip);

    _poseActions = {
      [PoseTypes.walk]: new PoseActionMock(true),
      [PoseTypes.head]: new PoseActionMock(false)
    } as Record<PoseTypes, IPoseAction>;
  });

  test("should initialize with default values", () => {
    const actions = new PlayerActions(
      _positionAction,
      _rotateAction,
      _poseActions,
      _playerId
    );
    expect(actions.positionAction).toBe(_positionAction);
    expect(actions.rotateAction).toBe(_rotateAction);
    expect(_positionAction.play).toHaveBeenCalled();
    expect(_rotateAction.play).toHaveBeenCalled();
    expect(_poseActions[PoseTypes.walk].play).toHaveBeenCalled();
    expect(_poseActions[PoseTypes.head].play).not.toHaveBeenCalled();
  });

  test("should get pose action by type", () => {
    const actions = new PlayerActions(
      _positionAction,
      _rotateAction,
      _poseActions,
      _playerId
    );
    const poseAction = actions.getPoseAction(PoseTypes.head);
    expect(poseAction).toBe(_poseActions[PoseTypes.head]);
  });

  test("should unpause all move actions", () => {
    const actions = new PlayerActions(
      _positionAction,
      _rotateAction,
      _poseActions,
      _playerId
    );
    actions.unPauseAllMoveActions();
    expect(_positionAction.paused).toBe(false);
    expect(_rotateAction.paused).toBe(false);
    expect(_poseActions[PoseTypes.walk].paused).toBe(false);
    expect(_poseActions[PoseTypes.head].paused).toBe(true);
  });

  test("should set time for postition & rotation actions", () => {
    const actions = new PlayerActions(
      _positionAction,
      _rotateAction,
      _poseActions,
      _playerId
    );
    const timeInSeconds = 10;
    actions.setTime(timeInSeconds);
    expect(_positionAction.time).toBe(timeInSeconds);
    expect(_rotateAction.time).toBe(timeInSeconds);
    expect(_poseActions[PoseTypes.walk].time).toBe(0);
    expect(_poseActions[PoseTypes.head].time).toBe(0);
  });

  describe("debug settings tests (to move later)", () => {
    test("should get pose actions", () => {
      const actions = new PlayerActions(
        _positionAction,
        _rotateAction,
        _poseActions,
        _playerId
      );

      const poseActions = actions.debug_poseActions;
      expect(poseActions).length(2);
      expect(poseActions).includes(_poseActions[PoseTypes.walk]);
      expect(poseActions).includes(_poseActions[PoseTypes.head]);
    });

    test("should stop all move actions", () => {
      const actions = new PlayerActions(
        _positionAction,
        _rotateAction,
        _poseActions,
        _playerId
      );
      actions.debug_stopAllMoveActions();
      expect(_positionAction.stop).toHaveBeenCalled();
      expect(_rotateAction.stop).toHaveBeenCalled();
      expect(_poseActions[PoseTypes.walk].stop).toHaveBeenCalled();
      expect(_poseActions[PoseTypes.head].stop).not.toHaveBeenCalled();
    });

    test("should play all move actions", () => {
      const actions = new PlayerActions(
        _positionAction,
        _rotateAction,
        _poseActions,
        _playerId
      );
      actions.debug_playAllMoveActions();
      expect(_positionAction.play).toHaveBeenCalled();
      expect(_rotateAction.play).toHaveBeenCalled();
      expect(_poseActions[PoseTypes.walk].play).toHaveBeenCalled();
      expect(_poseActions[PoseTypes.head].play).not.toHaveBeenCalled();
    });

    test("should pause all move actions", () => {
      const actions = new PlayerActions(
        _positionAction,
        _rotateAction,
        _poseActions,
        _playerId
      );
      actions.debug_pauseAllMoveActions();
      expect(_positionAction.paused).toBe(true);
      expect(_rotateAction.paused).toBe(true);
      expect(_poseActions[PoseTypes.walk].paused).toBe(true);
    });
  });
});
