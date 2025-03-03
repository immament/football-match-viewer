/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 stadium.glb -Tt 
Files: stadium.glb [21.97MB] > C:\Users\immam\dev\projects\football-match-viewer\public\models\stadium-transformed.glb [975.09KB] (96%)
*/

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

const MODEL_URL = "models/stadium-transformed.glb";

type GLTFResult = GLTF & {
  nodes: {
    bannerStop: THREE.Mesh;
    bannerEtop: THREE.Mesh;
    bannerNtop: THREE.Mesh;
    bannerWtop: THREE.Mesh;
    standingN: THREE.Mesh;
    standingS: THREE.Mesh;
    standingE: THREE.Mesh;
    standingW: THREE.Mesh;
    Cube039_Cube043: THREE.Mesh;
    Cylinder003: THREE.Mesh;
    Cylinder004: THREE.Mesh;
    Cube034_Cube037: THREE.Mesh;
    Cube035_Cube038: THREE.Mesh;
    Cube036_Cube039: THREE.Mesh;
    Pitch: THREE.Mesh;
    bannerNpitch: THREE.Mesh;
    bannerWpitch: THREE.Mesh;
    bannerEpitch: THREE.Mesh;
    bannerSpitch002: THREE.Mesh;
    bannerSpitch001: THREE.Mesh;
    bannerSpitch003: THREE.Mesh;
    GoalFrameWest: THREE.Mesh;
    GoalFrame: THREE.Mesh;
    TowerEN: THREE.Mesh;
    TowerNW: THREE.Mesh;
    TowerWS: THREE.Mesh;
    TowerSE: THREE.Mesh;
    benchseats001: THREE.Mesh;
    benchcube001: THREE.Mesh;
    benchcylinder001: THREE.Mesh;
    benchcube002: THREE.Mesh;
    benchseats002: THREE.Mesh;
    benchcylinder002: THREE.Mesh;
    NetWest001: THREE.Mesh;
    NetEast: THREE.Mesh;
    TowerEN_frame001: THREE.Mesh;
    TowerEN_frame002: THREE.Mesh;
    TowerEN_frame003: THREE.Mesh;
    TowerEN_frame004: THREE.Mesh;
    TowerNW_frame001: THREE.Mesh;
    TowerNW_frame002: THREE.Mesh;
    TowerNW_frame003: THREE.Mesh;
    TowerNW_frame004: THREE.Mesh;
    TowerWS_frame001: THREE.Mesh;
    TowerWS_frame002: THREE.Mesh;
    TowerWS_frame003: THREE.Mesh;
    TowerWS_frame004: THREE.Mesh;
    TowerSE_frame001: THREE.Mesh;
    TowerSE_frame002: THREE.Mesh;
    TowerSE_frame003: THREE.Mesh;
    TowerSE_frame004: THREE.Mesh;
  };
  materials: {
    ["Material.049"]: THREE.MeshStandardMaterial;
    ["standings.material"]: THREE.MeshStandardMaterial;
    ["Material.031"]: THREE.MeshStandardMaterial;
    ["Material.032"]: THREE.MeshStandardMaterial;
    ["Material.024"]: THREE.MeshStandardMaterial;
    ["Material.bench"]: THREE.MeshStandardMaterial;
    ["Material.Pitch"]: THREE.MeshStandardMaterial;
    ["Material.Ads"]: THREE.MeshStandardMaterial;
    ["Material.Ads"]: THREE.MeshStandardMaterial;
    None: THREE.MeshStandardMaterial;
    ["Material.060"]: THREE.MeshStandardMaterial;
  };
};

export function Stadium(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(MODEL_URL) as GLTFResult;
  useEffect(() => {
    if (materials["standings.material"].map) {
      // materials["standings.material"].map.wrapS = THREE.RepeatWrapping;
      // materials["standings.material"].map.wrapT = THREE.RepeatWrapping;
      // materials["standings.material"].map.rotation = Math.PI / 2;
      materials["standings.material"].map.repeat = new THREE.Vector2(1, 4);
    }
  }, [materials]);

  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.bannerStop.geometry}
        material={materials["Material.049"]}
      />
      <mesh
        geometry={nodes.bannerEtop.geometry}
        material={materials["Material.049"]}
      />
      <mesh
        geometry={nodes.bannerNtop.geometry}
        material={materials["Material.049"]}
      />
      <mesh
        geometry={nodes.bannerWtop.geometry}
        material={materials["Material.049"]}
      />
      <mesh
        geometry={nodes.standingN.geometry}
        material={materials["standings.material"]}
      />
      <mesh
        geometry={nodes.standingS.geometry}
        material={materials["standings.material"]}
      />
      <mesh
        geometry={nodes.standingE.geometry}
        material={materials["standings.material"]}
      />
      <mesh
        geometry={nodes.standingW.geometry}
        material={materials["standings.material"]}
      />
      <mesh
        geometry={nodes.Cube039_Cube043.geometry}
        material={materials["Material.031"]}
      />
      <mesh
        geometry={nodes.Cylinder003.geometry}
        material={materials["Material.032"]}
      />
      <mesh
        geometry={nodes.Cylinder004.geometry}
        material={materials["Material.032"]}
      />
      <mesh
        geometry={nodes.Cube034_Cube037.geometry}
        material={materials["Material.024"]}
      />
      <mesh
        geometry={nodes.Cube035_Cube038.geometry}
        material={materials["Material.024"]}
      />
      <mesh
        geometry={nodes.Cube036_Cube039.geometry}
        material={materials["Material.bench"]}
      />
      <mesh
        geometry={nodes.Pitch.geometry}
        material={materials["Material.Pitch"]}
      />
      <mesh
        geometry={nodes.bannerNpitch.geometry}
        material={materials["Material.Ads"]}
      />
      <mesh
        geometry={nodes.bannerWpitch.geometry}
        material={materials["Material.Ads"]}
      />
      <mesh
        geometry={nodes.bannerEpitch.geometry}
        material={materials["Material.Ads"]}
      />
      <mesh
        geometry={nodes.bannerSpitch002.geometry}
        material={materials["Material.Ads"]}
      />
      <mesh
        geometry={nodes.bannerSpitch001.geometry}
        material={materials["Material.Ads"]}
      />
      <mesh
        geometry={nodes.bannerSpitch003.geometry}
        material={materials["Material.Ads"]}
      />
      <mesh geometry={nodes.GoalFrameWest.geometry} material={materials.None} />
      <mesh geometry={nodes.GoalFrame.geometry} material={materials.None} />
      <mesh
        geometry={nodes.TowerEN.geometry}
        material={materials["Material.bench"]}
      />
      <mesh
        geometry={nodes.TowerNW.geometry}
        material={materials["Material.bench"]}
      />
      <mesh
        geometry={nodes.TowerWS.geometry}
        material={materials["Material.bench"]}
      />
      <mesh
        geometry={nodes.TowerSE.geometry}
        material={materials["Material.bench"]}
      />
      <mesh
        geometry={nodes.benchseats001.geometry}
        material={materials["Material.032"]}
      />
      <mesh
        geometry={nodes.benchcube001.geometry}
        material={materials["Material.060"]}
      />
      <mesh
        geometry={nodes.benchcylinder001.geometry}
        material={materials["Material.bench"]}
      />
      <mesh
        geometry={nodes.benchcube002.geometry}
        material={materials["Material.060"]}
      />
      <mesh
        geometry={nodes.benchseats002.geometry}
        material={materials["Material.032"]}
      />
      <mesh
        geometry={nodes.benchcylinder002.geometry}
        material={materials["Material.bench"]}
      />
      <mesh geometry={nodes.NetWest001.geometry} material={materials.None} />
      <mesh geometry={nodes.NetEast.geometry} material={materials.None} />
      <mesh
        geometry={nodes.TowerEN_frame001.geometry}
        material={materials.None}
      />
      <mesh
        geometry={nodes.TowerEN_frame002.geometry}
        material={materials.None}
      />
      <mesh
        geometry={nodes.TowerEN_frame003.geometry}
        material={materials.None}
      />
      <mesh
        geometry={nodes.TowerEN_frame004.geometry}
        material={materials.None}
      />
      <mesh
        geometry={nodes.TowerNW_frame001.geometry}
        material={materials.None}
      />
      <mesh
        geometry={nodes.TowerNW_frame002.geometry}
        material={materials.None}
      />
      <mesh
        geometry={nodes.TowerNW_frame003.geometry}
        material={materials.None}
      />
      <mesh
        geometry={nodes.TowerNW_frame004.geometry}
        material={materials.None}
      />
      <mesh
        geometry={nodes.TowerWS_frame001.geometry}
        material={materials.None}
      />
      <mesh
        geometry={nodes.TowerWS_frame002.geometry}
        material={materials.None}
      />
      <mesh
        geometry={nodes.TowerWS_frame003.geometry}
        material={materials.None}
      />
      <mesh
        geometry={nodes.TowerWS_frame004.geometry}
        material={materials.None}
      />
      <mesh
        geometry={nodes.TowerSE_frame001.geometry}
        material={materials.None}
      />
      <mesh
        geometry={nodes.TowerSE_frame002.geometry}
        material={materials.None}
      />
      <mesh
        geometry={nodes.TowerSE_frame003.geometry}
        material={materials.None}
      />
      <mesh
        geometry={nodes.TowerSE_frame004.geometry}
        material={materials.None}
      />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
