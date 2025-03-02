import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import { Mesh, MeshStandardMaterial } from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    Pitch: Mesh;
    Plane002: Mesh;
    BannerNorthCore: Mesh;
    GoalFrameWest: Mesh;
    Cube083_Cube099: Mesh;
    Tower001: Mesh;
    Cylinder020_Cylinder023: Mesh;
    Cylinder019_Cylinder022: Mesh;
    BannerNorthText: Mesh;
  };
  materials: {
    Pitch: MeshStandardMaterial;
    ["Material.003"]: MeshStandardMaterial;
    PaletteMaterial001: MeshStandardMaterial;
    PaletteMaterial002: MeshStandardMaterial;
    ["Material.050"]: MeshStandardMaterial;
    ["Material.040"]: MeshStandardMaterial;
    ["Material.056"]: MeshStandardMaterial;
    ["Material.055"]: MeshStandardMaterial;
    ["Material.045"]: MeshStandardMaterial;
  };
  animations: [];
};

const MODEL_URL = "models/stadium-transformed.glb";

export function Stadium(
  props: { hideStadium?: boolean } & JSX.IntrinsicElements["group"]
) {
  const { nodes, materials } = useGLTF(MODEL_URL, true) as GLTFResult;
  const controls = useControls("Stadium", {
    "Stands Visible": true,
  });

  return (
    <group {...props} position={[0, -0.01, 0]} dispose={null}>
      {/* Pitch */}
      <mesh
        geometry={nodes.Pitch.geometry}
        // material={materials.Pitch}
        receiveShadow
      >
        <primitive
          attach="material"
          object={materials.Pitch}
          metalness={0.2}
          roughness={1}
          // color={"#00cc00"}
          side={0}
        />
      </mesh>
      {/* Floor */}
      <mesh
        geometry={nodes.Plane002.geometry}
        material={materials["Material.003"]}
      />
      {/* Stands */}
      <mesh
        visible={controls["Stands Visible"]}
        geometry={nodes.BannerNorthCore.geometry}
        // material={materials.PaletteMaterial001}
      >
        <meshStandardMaterial attach="material" color={"#2f6599"} side={0} />
      </mesh>
      {/* Goals + Towers Parts */}
      <mesh
        visible={true}
        geometry={nodes.GoalFrameWest.geometry}
        material={materials.PaletteMaterial002}
      />
      {/* Banner top */}
      <mesh
        geometry={nodes.Cube083_Cube099.geometry}
        // material={materials["Material.050"]}
      >
        <primitive
          attach="material"
          object={materials["Material.050"]}
          side={0}
        />
      </mesh>
      {/* Towers */}
      <mesh geometry={nodes.Tower001.geometry}>
        <primitive
          attach="material"
          object={materials["Material.040"]}
          side={0}
        />
      </mesh>
      {/* Bench 1 */}
      <mesh
        geometry={nodes.Cylinder020_Cylinder023.geometry}
        material={materials["Material.056"]}
      />
      {/* Bench 2 */}
      <mesh
        geometry={nodes.Cylinder019_Cylinder022.geometry}
        material={materials["Material.055"]}
      ></mesh>
      <mesh
        geometry={nodes.BannerNorthText.geometry}
        // material={materials["Material.045"]}
      >
        <meshStandardMaterial attach="material" color={"red"} side={1} />
      </mesh>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
