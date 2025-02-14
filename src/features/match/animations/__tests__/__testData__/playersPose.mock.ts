import { RawPoseEvents } from "../../Pose.model";
export function getAllPlayerPoses(): RawPoseEvents[][] {
  return poses;
}
// playerIdx between 0-10
export function getPlayerPoses(
  teamIdx: number,
  playerIdx: number
): RawPoseEvents {
  return poses[teamIdx][playerIdx];
}

const poses: RawPoseEvents[][] = [
  [{ 1: "p" }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
  [{ 2: "w" }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
];
