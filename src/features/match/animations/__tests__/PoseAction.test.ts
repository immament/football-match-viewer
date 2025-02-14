import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Object3D,
} from "three";
import { describe, expect, test, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { PoseTypes } from "../Pose.model";
import { PoseAction } from "../PoseAction";
import { PoseRecord } from "../PoseAction.model";

vi.mock("three");

describe("PoseAction", () => {
  test("startAction with different pose type", () => {
    const poseAction = new PoseAction(
      true,
      PoseTypes.head,
      createAnimationMock()
    );
    const poseRecord = mock<PoseRecord>({ type: PoseTypes.idle });

    const result = poseAction.startAction(poseRecord);

    expect(result).toBeFalsy();
  });

  test("startAction with the same pose type", () => {
    const poseType = PoseTypes.head;
    const poseAction = new PoseAction(true, poseType, createAnimationMock());
    const poseRecord = mock<PoseRecord>({ type: poseType });

    const result = poseAction.startAction(poseRecord);

    expect(result).toBeTruthy();
  });

  test("startAction forward", () => {
    const expected = { time: 0.5, timeScale: 0.9, weight: 1 };

    const animationMock = createAnimationMock();

    const poseAction = new PoseAction(true, PoseTypes.head, animationMock);

    const poseRecord = mock<PoseRecord>({
      type: PoseTypes.head,
      startFrom: expected.time,
      timeScale: expected.timeScale,
    });

    poseAction.startAction(poseRecord, false);

    expect(poseAction.time).toBe(expected.time);
    expect(animationMock.setEffectiveTimeScale).toBeCalledWith(
      expected.timeScale
    );
    expect(animationMock.setEffectiveWeight).toBeCalledWith(expected.weight);
    expect(animationMock.play).toBeCalled();
  });

  test("startAction reverse", () => {
    const expected = { animationTime: 2, timeScale: 0.9, weight: 1 };

    // const animationClip = new AnimationClip(undefined, expected.animationTime);
    //vi.mocked(animationClip).duration = expected.animationTime;

    const AnimationClipMock = vi.fn(function (this: AnimationClip, duration) {
      this.duration = duration;
    });
    const animationClip = new AnimationClipMock(
      expected.animationTime
    ) as unknown as AnimationClip;
    const animationMock = vi.mocked(createAnimationMock(animationClip));
    animationMock.getClip.mockReturnValue(animationClip);

    const poseAction = new PoseAction(true, PoseTypes.head, animationMock);

    const poseRecord = mock<PoseRecord>({
      type: PoseTypes.head,
      startFrom: 0.5,
      timeScale: expected.timeScale,
    });

    poseAction.startAction(poseRecord, true);

    expect(poseAction.time).toBe(expected.animationTime);
    expect(animationMock.setEffectiveTimeScale).toBeCalledWith(
      expected.timeScale
    );
    expect(animationMock.setEffectiveWeight).toBeCalledWith(expected.weight);
    expect(animationMock.play).toBeCalled();
  });
});

function createAnimationMock(clip?: AnimationClip) {
  return new AnimationAction(
    new AnimationMixer({} as Object3D),
    clip ?? new AnimationClip()
  );
}
