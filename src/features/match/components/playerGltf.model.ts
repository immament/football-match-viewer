import { AnimationClip, Bone, MeshStandardMaterial, SkinnedMesh } from "three";
import { GLTF } from "three-stdlib";
import { PoseTypes } from "../animations/player/Pose.model";

type ActionName =
  | "pl.t_pose"
  | "sk.idle.anim"
  | "sk.jog_backward.anim"
  | "sk.jog_forward"
  | "sk.jog_strafe_left.anim"
  | "sk.jog_strafe_right.anim"
  | "sk.left_turn.anim"
  | "sk.offensive_idle.anim"
  | "sk.right_turn.anim"
  | "sk.soccer_header.anim"
  | "sk.soccer_idle"
  | "sk.soccer_pass.anim"
  | "sk.strike_forward_jog.anim"
  | "sk.throw_in.anim"
  | "sk.walking.anim"
  | "sk.walking_backward.anim";
interface GLTFAction extends AnimationClip {
  name: ActionName;
}
export type PlayerGLTFResult = GLTF & {
  nodes: {
    Ch38_Body: SkinnedMesh;
    Ch38_Shirt: SkinnedMesh;
    Ch38_Shoes: SkinnedMesh;
    Ch38_Shorts: SkinnedMesh;
    Ch38_Socks: SkinnedMesh;
    Ch38_Hair: SkinnedMesh;
    mixamorig5Hips: Bone;
  };

  materials: {
    Body_Material: MeshStandardMaterial;
    Shirt_Material: MeshStandardMaterial;
    Shoes_Material: MeshStandardMaterial;
    Shorts_Material: MeshStandardMaterial;
    Socks_Material: MeshStandardMaterial;
    Ch38_hair: MeshStandardMaterial;
  };

  animations: GLTFAction[];
};

export const actionNames: Record<PoseTypes, ActionName> = {
  tPose: "pl.t_pose",
  idle: "sk.idle.anim",
  walk: "sk.walking.anim",
  run: "sk.jog_forward",
  pass: "sk.soccer_pass.anim",
  shot: "sk.strike_forward_jog.anim",
  head: "sk.soccer_header.anim",
  throwIn: "sk.throw_in.anim",
  leftTurn: "sk.left_turn.anim",
  rightTurn: "sk.right_turn.anim",
  jogBack: "sk.jog_backward.anim",
  walkBack: "sk.walking_backward.anim",
  jogLeft: "sk.jog_strafe_left.anim",
  jogRight: "sk.jog_strafe_right.anim",
} as const;
