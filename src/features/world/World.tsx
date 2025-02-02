import { ContactShadows, Environment, Sky } from "@react-three/drei";
import { useControls } from "leva";
import { Match } from "../match/components/Match";
import { Stadium } from "./Stadium";

export const World = () => {
  const { envCtl, shadowCtl, dirLightCtl, ambientLightCtl } = useWorldCtls();
  // useEffect(() => console.log("World:", Math.random() * 10000), []);

  return (
    <>
      {envCtl.visible && <Environment preset="sunset"></Environment>}
      {shadowCtl.visible && <ContactShadows {...shadowCtl} />}
      <directionalLight
        visible={dirLightCtl.visible}
        position={[
          dirLightCtl.position.x,
          dirLightCtl.position.y,
          dirLightCtl.position.z,
        ]}
        castShadow={dirLightCtl.castShadow}
        intensity={dirLightCtl.intensity}
      />
      <ambientLight {...ambientLightCtl} />
      <Sky />
      <Stadium hideStadium={false} />
      <Match />
    </>
  );
};

function useWorldCtls() {
  const dirLightCtl = useControls("Directional Light", {
    visible: false,
    position: { x: 20, y: 20, z: 20 },
    castShadow: true,
    intensity: 1,
  });
  const ambientLightCtl = useControls("Ambient Light", {
    visible: false,
    intensity: 0.3,
  });
  const envCtl = useControls("Environment", {
    visible: true,
  });

  const shadowCtl = useControls("Shadows", {
    visible: false,
    opacity: 1,
    scale: 25,
    blur: 1,
    far: 2,
    resolution: 256,
    color: "#000000",
    width: 1,
    height: 1,
    //frames: 1,
  });

  return { envCtl, shadowCtl, dirLightCtl, ambientLightCtl };
}
