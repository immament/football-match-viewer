import { useMemo } from "react";
import {
  ColorRepresentation,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
} from "three";

export function useMaterialClone<
  T extends MeshStandardMaterial | MeshPhysicalMaterial | undefined
>(
  material?: T,
  color?: ColorRepresentation,
  emissive?: ColorRepresentation,
  tag?: string
): T {
  return useMemo(() => {
    if (tag === "log") console.log("socks", material, color);
    if (material == undefined) return material as T;
    const result = material.clone();
    if (color) result.color.set(color);
    if (emissive) result.emissive.set(emissive);
    return result as T;
  }, [material, color, emissive, tag]);
}
