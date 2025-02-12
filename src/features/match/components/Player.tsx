import { Billboard, Text, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useGraph } from "@react-three/fiber";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ColorRepresentation, Group } from "three";
import { SkeletonUtils } from "three-stdlib";
import { setupPlayerAnimations } from "../animations/setupPlayer";
import { GLTFResult } from "./playerGltf.model";
import { useMaterialClone } from "./useMaterialClone";
import { useAppZuStore } from "/app/app.zu.store";
import { ContainerContext } from "/app/Container.context";
import { round } from "/app/utils";

const MODEL_URL = "models/player-transformed.glb";

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
  const group = React.useRef<Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const poseAnimations = useAnimations(animations, group);

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

  const labelVisibleRef = useRef(false);

  const squadPlayer = useAppZuStore(
    (state) => state.teams.teamsArray[teamIdx].squadPlayers[playerIdx]
  );

  const [config, setConfig] =
    useState<ReturnType<typeof setupPlayerAnimations>>();

  useEffect(() => {
    if (matchData?.positions && group.current && !config) {
      // console.log("PLAYER useEffect setupPlayerAnimations");
      const result = setupPlayerAnimations(
        playerId,
        group.current,
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
      // console.log("PLAYER useEffect startTime", config.positionAction);
      if (!config.mixer.timeScale) {
        throw new Error("Player config.mixer.timeScale == 0");
      }
      config.positionAction.paused = false;
      config.rotateAction.paused = false;
      config.mixer.setTime(startTime / config.mixer.timeScale);
    }
  }, [config, startTime]);

  useEffect(() => {
    // console.log("PLAYER useEffect playbackSpeed");

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
      config.playerPoses.updatePose(delta);
      config.mixer.update(delta);
      updateDbgLabel(config);
    }
  });

  function labelVisible(visible: boolean) {
    if (labelRef.current) {
      labelRef.current.visible = visible;
    }
  }

  const labelRef = React.useRef<{ text: string; visible: boolean }>(null);
  const dbgLabelRef = React.useRef<{ text: string }>(null);
  return (
    <group
      name={`Player`}
      ref={group}
      {...props}
      dispose={null}
      visible={!!config}
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

      <Billboard>
        <Text
          color="black"
          anchorX="center"
          anchorY="bottom"
          position={[0, 2, 0]}
          fontSize={0.3}
          ref={labelRef}
          visible={labelVisibleRef.current}
        >
          {`${teamIdx ? "Away" : "Home"}\n${squadPlayer.shirtNumber}. ${
            squadPlayer.name
          }`}
        </Text>
      </Billboard>
      <group
        name={`Player-${teamIdx}-${playerIdx}`}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.01}
        ref={group}
        {...props}
        dispose={null}
        onPointerEnter={(e) => {
          e.stopPropagation();
          labelVisible(true);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          if (!labelVisibleRef.current) {
            labelVisible(false);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          labelVisibleRef.current = !labelVisibleRef.current;
          labelVisible(labelVisibleRef.current);
        }}
      >
        <primitive object={nodes.mixamorig5Hips} />
        <skinnedMesh
          name="Ch38_Body"
          geometry={nodes.Ch38_Body.geometry}
          material={bodyMaterial}
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
          material={socksMaterial}
          skeleton={nodes.Ch38_Socks.skeleton}
        />
        <skinnedMesh
          name="Ch38_Shoes"
          geometry={nodes.Ch38_Shoes.geometry}
          material={shoesMaterial}
          skeleton={nodes.Ch38_Shoes.skeleton}
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
