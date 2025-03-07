import { Group, Mesh, Object3D, Object3DEventMap } from "three";
import { GLTFParser } from "three-stdlib";

export async function selectKHRMaterialsVariant(
  scene: Group,
  parser: GLTFParser,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extension: { variants: any[] },
  variantName: string
) {
  type KHRMaterialsVariantsMappings = {
    material: number;
    variants: number[];
  };

  const variantIndex = extension.variants.findIndex((v) =>
    v.name.includes(variantName)
  );

  let mapping: { material: number } | undefined;

  scene.traverse((object) => {
    if (!isMesh(object) || !object.userData.gltfExtensions) return;

    const meshVariantDef =
      object.userData.gltfExtensions["KHR_materials_variants"];

    if (!meshVariantDef) return;

    if (!object.userData.originalMaterial) {
      object.userData.originalMaterial = object.material;
    }

    mapping = meshVariantDef.mappings.find(
      (mapping: KHRMaterialsVariantsMappings) =>
        mapping.variants.includes(variantIndex)
    );
  });

  if (mapping) {
    const material = await parser.getDependency("material", mapping.material);
    return material;
  }
  return undefined;
}
function isMesh(object: Object3D<Object3DEventMap>): object is Mesh {
  return (object as Mesh).isMesh;
}
