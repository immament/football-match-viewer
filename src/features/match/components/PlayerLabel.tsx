import { Billboard, Text } from "@react-three/drei";
import { round } from "/app/utils";

export function PlayerLabel({
  teamIdx,
  playerIdx,
  time,
}: {
  teamIdx: number;
  playerIdx: number;
  time?: number;
}) {
  return (
    <Billboard>
      <Text
        color="black"
        anchorX="center"
        anchorY="bottom"
        position={[0, 2, 0]}
        fontSize={0.3}
      >
        {`${teamIdx === 0 ? "Home" : "Away"} Player ${playerIdx + 1}`}
        {time && ` (${round(time, 1)})`}
      </Text>
    </Billboard>
  );
}
