import { Billboard, Text } from "@react-three/drei";

export function PlayerLabel({
  teamIdx,
  playerIdx,
}: {
  teamIdx: number;
  playerIdx: number;
}) {
  return (
    <Billboard>
      <Text
        color="black"
        anchorX="center"
        anchorY="bottom"
        position={[0, 2, 0]}
        fontSize={0.3}
      >{`${teamIdx === 0 ? "Home" : "Away"} Player ${playerIdx + 1}`}</Text>
    </Billboard>
  );
}
