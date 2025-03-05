import { Billboard, Text, useAnimations, useGLTF } from "@react-three/drei";
import { RootState } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import { Group } from "three";
import { SkeletonUtils } from "three-stdlib";
import { PoseRecord } from "../animations/player/PoseAction.model";
import {
  PlayerAnimationsConfig,
  setupPlayerAnimations,
} from "../animations/player/setupPlayer";
import { PlayerId } from "../PlayerId";
import { PlayerMesh, PlayerProps } from "./PlayerMesh";
import { useMatchDirector } from "./useMatchDirector";
import { useAppZuStore } from "/app/app.zu.store";
import { logger } from "/app/logger";

const MODEL_URL = "models/player-transformed.glb";

export function Player({
  player,
  teamIdx,
  playerIdx,
  dbgLabelVisible,
  colors,
  ...props
}: PlayerProps & {
  dbgLabelVisible?: boolean;
} & JSX.IntrinsicElements["group"]) {
  const playerId: PlayerId = useMemo(
    () => ({ teamIdx, playerIdx }),
    [teamIdx, playerIdx]
  );

  const playerRef = React.useRef<Group>(null);
  const { scene: model, animations } = useGLTF(MODEL_URL);
  const modelClone = React.useMemo(() => SkeletonUtils.clone(model), [model]);
  const poseAnimations = useAnimations(animations, playerRef);

  const config = useRef<PlayerAnimationsConfig>();

  const matchPaused = useAppZuStore((state) => state.mediaPlayer.paused);
  const startTime = useAppZuStore((state) => state.mediaPlayer.startTime);
  const playbackSpeed = useAppZuStore(
    (state) => state.mediaPlayer.playbackSpeed
  );

  const squadPlayer = useAppZuStore(
    (state) => state.teams.teamsArray[teamIdx].squadPlayers[playerIdx]
  );
  const isDebug = useAppZuStore(({ debug }) => debug.isDebug);

  useEffect(() => {
    config.current?.gotoTime(startTime);
  }, [startTime]);

  useEffect(() => {
    config.current?.changePlaybackSpeed(playbackSpeed);
  }, [playbackSpeed]);

  useEffect(() => {
    if (config.current) return;
    if (playerRef.current && player.movements) {
      if (!playerId.playerIdx) logger.debug("useEffect player");
      const result = setupPlayerAnimations(
        playerId,
        playerRef.current,
        poseAnimations.actions,
        player.movements
      );
      config.current = result;
      result.startMatch(startTime, playbackSpeed);
    }
  }, [poseAnimations.actions, playerId, player, startTime, playbackSpeed]);

  useEffect(() => {
    if (poseAnimations.mixer)
      poseAnimations.mixer.timeScale = matchPaused ? 0 : playbackSpeed;
  }, [poseAnimations.mixer, playbackSpeed, matchPaused]);

  const lastRawPoseRef = useRef<string>();
  const onFrameUpdate = useMemo(() => {
    return (_: RootState, delta: number) => {
      if (!config.current) return;
      const pose = config.current.updatePose(delta);
      if (pose) {
        labelVisible(pose.distanceToBall < 2);
      }
      updateDbgLabel(
        dbgLabelRef.current,
        dbgLabelVisible,
        pose,
        lastRawPoseRef,
        config.current,
        playerId
      );
    };
  }, [config, playerId, dbgLabelVisible]);

  function labelVisible(visible = false) {
    const isVisible =
      playerSelectedRef.current || playerHoverRef.current || visible;
    if (labelRef.current) {
      labelRef.current.visible = isVisible;
    }
    // if (labelHtmlRef.current) {
    //   labelHtmlRef.current.style.display = isVisible ? "block" : "none";
    // }
  }

  useMatchDirector(config.current?.get_mixer, false, onFrameUpdate);

  const labelRef = useRef<Group>(null);
  // const labelHtmlRef = useRef<HTMLDivElement>(null);
  const playerSelectedRef = useRef(false);
  const playerHoverRef = useRef(false);
  const dbgLabelRef = useRef<{ text: string }>(null);

  return (
    <group
      name={`Player`}
      key={`${teamIdx}-${playerIdx}`}
      ref={playerRef}
      {...props}
      dispose={null}
      visible={!!modelClone}
      raycast={() => null}
      position-x={(teamIdx ? 1.1 : -1.1) * (2 + playerIdx)}
      {...props}
    >
      <PlayerMesh
        model={modelClone}
        colors={colors}
        player={player}
        playerIdx={playerIdx}
        teamIdx={teamIdx}
      />

      <Billboard visible={false} ref={labelRef}>
        <Text
          color="black"
          anchorX="center"
          anchorY="bottom"
          textAlign="center"
          position={[0, 2, 0]}
          fontSize={0.3}
        >
          {`${squadPlayer.shirtNumber}. ${squadPlayer.name}`}
        </Text>
      </Billboard>

      {/* <Html
        style={{display: "none"}}
        className="player-label"
        wrapperClass="player-label-wrapper"
        ref={labelHtmlRef}
        position={[0, 2, 0]}
        center
      >{`${squadPlayer.shirtNumber}. ${squadPlayer.name}`}</Html> 
      */}
      {/* Raycast mesh helper */}
      <mesh
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
        <boxGeometry args={[0.5, 1.7, 0.5]} />
        <meshBasicMaterial
          wireframe={true}
          transparent={true}
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
      {isDebug && (
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
      )}
    </group>
  );
}

useGLTF.preload(MODEL_URL);

function updateDbgLabel(
  dbgLabel: { text: string } | null,
  dbgLabelVisible: boolean | undefined,
  pose: PoseRecord | undefined,
  lastRawPoseRef: React.MutableRefObject<string | undefined>,
  config: PlayerAnimationsConfig,
  playerId: PlayerId
) {
  if (!dbgLabel || !dbgLabelVisible) return;

  if (pose?.rawPose) {
    lastRawPoseRef.current = `(${config.step()}: ${pose.rawPose})`;
  }
  dbgLabel.text =
    (config.time() > 0 &&
      `(step: ${config.step()}, time: ${config.time().toFixed(1)})\n`) +
    `${playerId.teamIdx === 0 ? "Home" : "Away"} ${playerId.playerIdx + 1} ${
      pose?.type ?? ""
    } / ${lastRawPoseRef.current ?? ""} / ${pose?.rawPose ?? ""}`;
}
