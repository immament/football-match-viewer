import { useGLTF } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useState } from "react";
import { TeamIdx } from "../MatchData.model";
import { Player, PLAYER_MODEL_URL } from "./Player";
import { PlayerGLTFResult } from "./playerGltf.model";
import { PlayerMaterials } from "./PlayerMesh";
import { useMaterialClone } from "./useMaterialClone";
import { TeamState } from "/app/teams.slice";

export function Team({ team, teamIdx }: { team: TeamState; teamIdx: TeamIdx }) {
  const { dbgLabelVisible } = useControls("Players", {
    dbgLabelVisible: false,
  });

  const { scene: model, ...gltfRest } = useGLTF(PLAYER_MODEL_URL);
  const { materials: modelMaterials } = useGraph(model) as PlayerGLTFResult;

  const shortsMaterial = useMaterialClone(
    modelMaterials.Shorts_Material,
    team.colors.shorts
  );
  const socksMaterial = useMaterialClone(
    modelMaterials.Socks_Material,
    team.colors.socks,
    undefined,
    "socks"
  );

  const [materials, setMaterials] = useState<PlayerMaterials>();

  useEffect(() => {
    function prepareMaterials() {
      // modelMaterials.Body_Material.roughness = 0.65;
      setMaterials({
        shorts: shortsMaterial,
        socks: socksMaterial,
        body: modelMaterials.Body_Material,
        shirt: modelMaterials.Shirt_Material,
        shoes: modelMaterials.Shoes_Material,
        hair: modelMaterials.Ch38_hair,
      });
    }
    prepareMaterials();
  }, [modelMaterials, shortsMaterial, socksMaterial, gltfRest, model]);

  if (!materials) return <></>;
  return (
    team.squadPlayers
      // .filter((_, idx) => idx === 10 && teamIdx === 0)
      .map((player, playerIdx) => {
        return (
          <Player
            key={`${team.id}-${playerIdx}`}
            teamIdx={teamIdx}
            player={player}
            playerIdx={playerIdx}
            colors={team.colors}
            dbgLabelVisible={dbgLabelVisible}
            materials={materials}
          />
        );
      })
  );
}
