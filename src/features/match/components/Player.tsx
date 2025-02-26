import { Billboard, Text, useAnimations, useGLTF } from "@react-three/drei";
import { RootState, useGraph } from "@react-three/fiber";
import React, { useContext, useEffect, useMemo, useRef } from "react";
import { BufferGeometry, ColorRepresentation, Group } from "three";
import { computeBoundsTree } from "three-mesh-bvh";
import { SkeletonUtils } from "three-stdlib";
import { PoseRecord } from "../animations/PoseAction.model";
import { secondsToStep } from "../animations/positions.utils";
import {
  PlayerAnimationsConfig,
  setupPlayerAnimations,
} from "../animations/setupPlayer";
import { GLTFResult } from "./playerGltf.model";
import { useMatchDirector } from "./useMatchDirector";
import { useMaterialClone } from "./useMaterialClone";
import { useAppZuStore } from "/app/app.zu.store";
import { ContainerContext } from "/app/Container.context";

const MODEL_URL = "models/player-transformed.glb";

BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;

// bvhHelper = new MeshBVHHelper(meshHelper, 10);
// scene.add(bvhHelper);

export type PlayerProps = {
  shirtColor: ColorRepresentation;
  shortsColor: ColorRepresentation;
  bodyColor: ColorRepresentation;
  teamIdx: 0 | 1;
  playerIdx: number;
  dbgLabelVisible: boolean;
};

export function Player({
  shirtColor,
  shortsColor,
  bodyColor,
  teamIdx,
  playerIdx,
  dbgLabelVisible,
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
  const bodyMaterial = materials.Ch38_body;
  // TODO: body color is to dark;
  // const bodyMaterial = useMaterialClone(materials.Ch38_body, bodyColor);
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

  const config = useRef<PlayerAnimationsConfig>();

  useEffect(() => {
    if (matchData?.positions && playerRef.current && !config.current) {
      const result = setupPlayerAnimations(
        playerId,
        playerRef.current,
        matchData.positions,
        poseAnimations.actions
      );
      config.current = result;
      result.playerPoses.forceIdle();
      result.positionAction.play();
      result.rotateAction.play();
    }
  }, [matchData, poseAnimations.actions, playerId]);

  useEffect(() => {
    if (config.current) {
      if (!config.current.mixer.timeScale) {
        throw new Error("Player config.mixer.timeScale == 0");
      }
      config.current.positionAction.paused = false;
      config.current.rotateAction.paused = false;
      config.current.mixer.setTime(startTime / config.current.mixer.timeScale);
    }
  }, [startTime]);

  useEffect(() => {
    if (config.current) {
      config.current.mixer.timeScale = playbackSpeed;
      config.current.positionAction.paused = false;
      config.current.rotateAction.paused = false;
    }
  }, [playbackSpeed]);

  const lastRawPoseRef = useRef<string>();

  useEffect(() => {
    if (poseAnimations.mixer)
      poseAnimations.mixer.timeScale = matchPaused ? 0 : playbackSpeed;
  }, [poseAnimations.mixer, playbackSpeed, matchPaused]);

  const ctx = useContext(ContainerContext);

  const onFrameUpdate = useMemo(() => {
    return (_: RootState, delta: number) => {
      if (matchPaused || !config.current) return;
      const pose = config.current.playerPoses.updatePose(delta);
      if (pose) {
        labelVisible(pose.distanceToBall < 2);
      }
      updateDbgLabel(config.current, pose);
    };

    function updateDbgLabel(
      config: PlayerAnimationsConfig,
      pose: PoseRecord | undefined
    ) {
      if (dbgLabelRef.current && dbgLabelVisible) {
        const step = secondsToStep(config.mixer.time);
        if (pose?.rawPose) {
          lastRawPoseRef.current = `(${step}: ${pose.rawPose})`;
        }
        dbgLabelRef.current.text =
          (config.mixer.time > 0 &&
            `(step: ${step}, time: ${config.mixer.time.toFixed(1)})\n`) +
          `${teamIdx === 0 ? "Home" : "Away"} ${playerIdx + 1} ${
            pose?.type
          } / ${lastRawPoseRef.current ?? ""} / ${pose?.rawPose ?? ""}`;
      }
    }
  }, [config, matchPaused, teamIdx, playerIdx, dbgLabelVisible]);

  function labelVisible(visible = false) {
    if (labelRef.current) {
      labelRef.current.visible =
        playerSelectedRef.current || playerHoverRef.current || visible;
    }
  }

  useMatchDirector(config.current?.mixer, false, onFrameUpdate);

  const labelRef = useRef<Group>(null);
  const playerSelectedRef = useRef(false);
  const playerHoverRef = useRef(false);
  const dbgLabelRef = useRef<{ text: string }>(null);

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
              color="#505050"
              anchorX="center"
              anchorY="bottom"
              textAlign="center"
              position={[0, 2.3, 0]}
              fontSize={0.3}
              ref={dbgLabelRef}
              visible={dbgLabelVisible}
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
          textAlign="center"
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
        position-y={0.9}
      >
        {/* <bufferGeometry attach="geometry" /> */}
        <boxGeometry args={[0.5, 1.7, 0.5]} />
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
          castShadow
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
}

useGLTF.preload(MODEL_URL);
