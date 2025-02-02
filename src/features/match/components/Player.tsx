import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useGraph } from "@react-three/fiber";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ColorRepresentation, Group } from "three";
import { SkeletonUtils } from "three-stdlib";
import { setupPlayerAnimations } from "../animations/setupPlayer";
import {
  selectMatchData,
  selectPaused,
  selectPlaybackSpeed,
  selectStartTime,
} from "../match.slice";
import { GLTFResult } from "../playerGltf.model";
import { useMaterialClone } from "../useMaterialClone";
import { PlayerLabel } from "./PlayerLabel";
import { ContainerContext } from "/app/Container.context";
import { useAppSelector } from "/app/withTypes";

const MODEL_URL = "models/player-transformed.glb";

// let lastTransitionId = 0;

type PlayerProps = {
  shirtColor: ColorRepresentation;
  shortsColor: ColorRepresentation;
  teamIdx: 0 | 1;
  playerIdx: number;
};

export function Player({
  shirtColor,
  shortsColor,
  teamIdx,
  playerIdx,
  ...props
}: PlayerProps & JSX.IntrinsicElements["group"]) {
  const playerId = useMemo(
    () => ({ teamIdx, playerIdx }),
    [teamIdx, playerIdx]
  );
  const group = React.useRef<Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const animationsResult = useAnimations(animations, group);

  const sceneClone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(sceneClone) as GLTFResult;

  const shirtMaterial = useMaterialClone(materials.Ch38_body, shirtColor);
  const shortsMaterial = useMaterialClone(materials.Ch38_body, shortsColor);

  const matchData = useAppSelector(selectMatchData);
  const matchPaused = useAppSelector(selectPaused);
  const startTime = useAppSelector(selectStartTime);
  const playbackSpeed = useAppSelector(selectPlaybackSpeed);

  const [config, setConfig] =
    useState<ReturnType<typeof setupPlayerAnimations>>();

  useEffect(() => {
    if (matchData?.positions && group.current && !config) {
      // console.log("configuring player");
      const result = setupPlayerAnimations(
        playerId,
        group.current,
        matchData.positions,
        animationsResult.actions
      );
      setConfig(result);
      // result.playerPoses.forceUpdatePose = true;
      result.playerPoses.forceIdle();
      result.positionAction.play();
      result.rotateAction.play();
    }
  }, [matchData, animationsResult.actions, playerId, config]);

  useEffect(() => {
    if (config?.mixer) {
      config.mixer.setTime(startTime / config.mixer.timeScale);
    }
  }, [config?.mixer, startTime]);

  useFrame((_, delta) => {
    if (matchPaused) return;
    if (config) {
      // if (paused && !config.playerPoses.forceUpdatePose) return;
      config.playerPoses.updatePose(delta);
      config.mixer.update(delta);
    }
  });

  useEffect(() => {
    animationsResult.mixer.timeScale = matchPaused ? 0 : playbackSpeed;
  }, [matchPaused, animationsResult.mixer, playbackSpeed]);

  useEffect(() => {
    if (config) config.mixer.timeScale = playbackSpeed;
    if (animationsResult.mixer)
      animationsResult.mixer.timeScale = playbackSpeed;
  }, [config, animationsResult, playbackSpeed]);

  const ctx = useContext(ContainerContext);
  return (
    <group
      name={`Player`}
      ref={group}
      {...props}
      dispose={null}
      visible={!!config}
    >
      {ctx?.debugMode && (
        <PlayerLabel teamIdx={teamIdx} playerIdx={playerIdx} />
      )}
      <group
        name={`Player-${teamIdx}-${playerIdx}`}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.01}
        ref={group}
        {...props}
        dispose={null}
      >
        <primitive object={nodes.mixamorig5Hips} />
        <skinnedMesh
          name="Ch38_Body"
          geometry={nodes.Ch38_Body.geometry}
          material={materials.Ch38_body}
          skeleton={nodes.Ch38_Body.skeleton}
        ></skinnedMesh>
        <skinnedMesh
          name="Ch38_Shirt"
          geometry={nodes.Ch38_Shirt.geometry}
          material={shirtMaterial}
          skeleton={nodes.Ch38_Shirt.skeleton}
        ></skinnedMesh>
        <skinnedMesh
          name="Ch38_Shorts"
          geometry={nodes.Ch38_Shorts.geometry}
          material={shortsMaterial}
          skeleton={nodes.Ch38_Shorts.skeleton}
        />
        <skinnedMesh
          name="Ch38_Socks"
          geometry={nodes.Ch38_Socks.geometry}
          material={shirtMaterial}
          skeleton={nodes.Ch38_Socks.skeleton}
        />
        <skinnedMesh
          name="Ch38_Shoes"
          geometry={nodes.Ch38_Shoes.geometry}
          material={materials.Ch38_body}
          skeleton={nodes.Ch38_Shoes.skeleton}
        />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
