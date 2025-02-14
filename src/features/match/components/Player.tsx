import { Billboard, Text, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useGraph } from "@react-three/fiber";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { BufferGeometry, ColorRepresentation, Group } from "three";
import { computeBoundsTree } from "three-mesh-bvh";
import { SkeletonUtils } from "three-stdlib";
import { setupPlayerAnimations } from "../animations/setupPlayer";
import { GLTFResult } from "./playerGltf.model";
import { useMaterialClone } from "./useMaterialClone";
import { useAppZuStore } from "/app/app.zu.store";
import { ContainerContext } from "/app/Container.context";
import { round } from "/app/utils";

const MODEL_URL = "models/player-transformed.glb";

BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;

// bvhHelper = new MeshBVHHelper(meshHelper, 10);
// scene.add(bvhHelper);

type PlayerProps = {
  shirtColor: ColorRepresentation;
  shortsColor: ColorRepresentation;
  bodyColor: ColorRepresentation;
  teamIdx: 0 | 1;
  playerIdx: number;
};

export function Player({
  shirtColor,
  shortsColor,
  bodyColor,
  teamIdx,
  playerIdx,
  ...props
}: PlayerProps & JSX.IntrinsicElements["group"]) {
  const playerId = useMemo(
    () => ({ teamIdx, playerIdx }),
    [teamIdx, playerIdx]
  );

  const playerRef = React.useRef<Group>(null);
  const groupRef = React.useRef<Group>(new Group());

  const { scene, animations } = useGLTF(MODEL_URL);
  const poseAnimations = useAnimations(animations, playerRef);

  const sceneClone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(sceneClone) as GLTFResult;

  const shirtMaterial = useMaterialClone(materials.Ch38_body, shirtColor);
  const bodyMaterial = useMaterialClone(materials.Ch38_body, bodyColor);
  const shortsMaterial = useMaterialClone(materials.Ch38_body, shortsColor);
  const socksMaterial = useMaterialClone(materials.Ch38_body, shirtColor);
  const shoesMaterial = useMaterialClone(materials.Ch38_body, shortsColor);

  const matchData = useAppZuStore((state) => state.matchData.data);
  const matchPaused = useAppZuStore((state) => state.mediaPlayer.paused);
  const startTime = useAppZuStore((state) => state.mediaPlayer.startTime);
  const playbackSpeed = useAppZuStore(
    (state) => state.mediaPlayer.playbackSpeed
  );

  const squadPlayer = useAppZuStore(
    (state) => state.teams.teamsArray[teamIdx].squadPlayers[playerIdx]
  );

  const [config, setConfig] =
    useState<ReturnType<typeof setupPlayerAnimations>>();

  useEffect(() => {
    if (matchData?.positions && playerRef.current && !config) {
      const result = setupPlayerAnimations(
        playerId,
        playerRef.current,
        matchData.positions,
        poseAnimations.actions
      );
      setConfig(result);
      result.playerPoses.forceIdle();
      result.positionAction.play();
      result.rotateAction.play();
    }
  }, [matchData, poseAnimations.actions, playerId, config]);

  useEffect(() => {
    if (config) {
      if (!config.mixer.timeScale) {
        throw new Error("Player config.mixer.timeScale == 0");
      }
      config.positionAction.paused = false;
      config.rotateAction.paused = false;
      config.mixer.setTime(startTime / config.mixer.timeScale);
    }
  }, [config, startTime]);

  useEffect(() => {
    if (config) {
      config.mixer.timeScale = playbackSpeed;
      config.positionAction.paused = false;
      config.rotateAction.paused = false;
    }
    if (poseAnimations.mixer)
      poseAnimations.mixer.timeScale = matchPaused ? 0 : playbackSpeed;
  }, [config, poseAnimations, playbackSpeed, matchPaused]);

  const ctx = useContext(ContainerContext);

  useFrame((_, delta) => {
    if (matchPaused) return;
    if (config) {
      // if (paused && !config.playerPoses.forceUpdatePose) return;
      const pose = config.playerPoses.updatePose(delta);
      if (pose) {
        labelVisible(pose.distanceToBall < 2);
      }
      config.mixer.update(delta);
      updateDbgLabel(config);

      // if (playerRef.current) {
      //   meshHelper.current.position.copy(playerRef.current.position);
      //   // bvhHelper.current?.position.copy(playerRef.current.position);
      // }
      // meshHelper.current.position.copy(scene.position);
      // bvhHelper.current?.update();
      // regenerateMesh();
    }
  });

  const labelRef = useRef<Group>(null);
  const playerSelectedRef = useRef(false);
  const playerHoverRef = useRef(false);
  const dbgLabelRef = useRef<{ text: string }>(null);

  function labelVisible(visible = false) {
    if (labelRef.current) {
      labelRef.current.visible =
        playerSelectedRef.current || playerHoverRef.current || visible;
    }
  }

  // function regenerateMesh() {
  //   if (meshHelper.current) {
  //     console.log("regenerateMesh");
  //     // let generateTime, refitTime, startTime;

  //     // time the geometry generation
  //     // startTime = window.performance.now();
  //     staticGeometryGenerator.current.generate(meshHelper.current.geometry);
  //     // generateTime = window.performance.now() - startTime;

  //     // time the bvh refitting
  //     // startTime = window.performance.now();
  //     if (!meshHelper.current.geometry.boundsTree) {
  //       meshHelper.current.geometry.computeBoundsTree();
  //       // refitTime = "-";
  //     } else {
  //       meshHelper.current.geometry.boundsTree.refit();
  //       // refitTime = (window.performance.now() - startTime).toFixed(2);
  //     }

  //     // bvhHelper.current.update();
  //     // timeSinceUpdate = 0;
  //   }
  // }

  // useEffect(() => {
  //   // regenerateMesh();
  // }, []);

  return (
    <group
      name={`Player`}
      ref={playerRef}
      {...props}
      dispose={null}
      visible={!!config}
      raycast={() => null}
    >
      {ctx?.debugMode && (
        <>
          <Billboard>
            <Text
              color="black"
              anchorX="center"
              anchorY="bottom"
              position={[0, 2.3, 0]}
              fontSize={0.3}
              ref={dbgLabelRef}
            >
              {" "}
            </Text>
          </Billboard>
        </>
      )}

      <Billboard visible={false} ref={labelRef}>
        <Text
          color="black"
          anchorX="center"
          anchorY="bottom"
          position={[0, 2, 0]}
          fontSize={0.3}
        >
          {/* ${teamIdx ? "Away" : "Home"}\n */}
          {`${squadPlayer.shirtNumber}. ${squadPlayer.name}`}
        </Text>
      </Billboard>
      <mesh
        // ref={meshHelper}
        onPointerEnter={(e) => {
          e.stopPropagation();
          playerHoverRef.current = true;
          labelVisible();
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          playerHoverRef.current = false;
          labelVisible();
        }}
        onClick={(e) => {
          e.stopPropagation();
          playerSelectedRef.current = !playerSelectedRef.current;
          labelVisible(playerSelectedRef.current);
        }}
        visible={false}
      >
        {/* <bufferGeometry attach="geometry" /> */}
        <boxGeometry args={[0.5, 3.4, 0.5]} />
        <meshBasicMaterial
          wireframe={true}
          transparent={true}
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>

      <group
        name={`Player-${teamIdx}-${playerIdx}`}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.01}
        dispose={null}
        ref={groupRef}
        raycast={() => null}
      >
        <primitive object={nodes.mixamorig5Hips} />
        <skinnedMesh
          name="Ch38_Body"
          geometry={nodes.Ch38_Body.geometry}
          material={bodyMaterial}
          skeleton={nodes.Ch38_Body.skeleton}
          raycast={() => null}
        ></skinnedMesh>
        <skinnedMesh
          name="Ch38_Shirt"
          geometry={nodes.Ch38_Shirt.geometry}
          material={shirtMaterial}
          skeleton={nodes.Ch38_Shirt.skeleton}
          raycast={() => null}
        ></skinnedMesh>

        <skinnedMesh
          name="Ch38_Shorts"
          geometry={nodes.Ch38_Shorts.geometry}
          material={shortsMaterial}
          skeleton={nodes.Ch38_Shorts.skeleton}
          raycast={() => null}
        />
        <skinnedMesh
          name="Ch38_Socks"
          geometry={nodes.Ch38_Socks.geometry}
          material={socksMaterial}
          skeleton={nodes.Ch38_Socks.skeleton}
          raycast={() => null}
        />
        <skinnedMesh
          name="Ch38_Shoes"
          geometry={nodes.Ch38_Shoes.geometry}
          material={shoesMaterial}
          skeleton={nodes.Ch38_Shoes.skeleton}
          raycast={() => null}
        />
      </group>
    </group>
  );

  function updateDbgLabel(config: ReturnType<typeof setupPlayerAnimations>) {
    if (dbgLabelRef.current) {
      dbgLabelRef.current.text =
        `${teamIdx === 0 ? "Home" : "Away"} Player ${playerIdx + 1}` +
        (config.mixer.time > 0 && ` (${round(config.mixer.time, 1)})`);
    }
  }
}

useGLTF.preload(MODEL_URL);
