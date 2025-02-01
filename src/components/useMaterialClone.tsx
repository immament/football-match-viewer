import { useMemo } from "react";
import { ColorRepresentation, MeshStandardMaterial } from "three";

export function useMaterialClone(
  material: MeshStandardMaterial,
  color?: ColorRepresentation
) {
  return useMemo(() => {
    const result = material.clone();
    if (color) result.color.set(color);
    return result;
  }, [material, color]);
}
