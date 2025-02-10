import { ContactShadows, Environment, Sky } from "@react-three/drei";
import { useControls } from "leva";
import { useContext, useRef } from "react";
import { DirectionalLight } from "three";
import { Match } from "../match/components/Match";
import { Stadium } from "./Stadium";
import { ContainerContext } from "/app/Container.context";

export const World = () => {
  const { envCtl, shadowCtl, dirLightCtl, ambientLightCtl, skyCtl } =
    useWorldCtls();
  const dirLight = useRef<DirectionalLight>(null);
  const ctx = useContext(ContainerContext);

  return (
    <>
      {envCtl.visible && (
        <Environment
          preset="city"
          background={false}
          ground={{ height: 10, radius: 260, scale: 130 }}
          far={1000}
        ></Environment>
      )}
      {shadowCtl.visible && <ContactShadows {...shadowCtl} />}
      {(dirLightCtl.visible || dirLight.current) && (
        <directionalLight
          ref={dirLight}
          visible={dirLightCtl.visible}
          position={[
            dirLightCtl.position.x,
            dirLightCtl.position.y,
            dirLightCtl.position.z,
          ]}
          castShadow={dirLightCtl.castShadow}
          intensity={dirLightCtl.intensity}
        />
      )}

      <ambientLight {...ambientLightCtl} />
      {skyCtl.visible && <Sky />}
      <Stadium hideStadium={false} />
      <Match />
      {ctx?.debugMode && dirLight.current && (
        <directionalLightHelper
          args={[dirLight.current, 2, 0xff0000]}
          visible={dirLight.current.visible}
        />
      )}
    </>
  );
};

function useWorldCtls() {
  const dirLightCtl = useControls("Directional Light", {
    visible: false,
    position: { x: 1, y: 20, z: 1 },
    castShadow: false,
    intensity: 3,
  });
  const ambientLightCtl = useControls("Ambient Light", {
    visible: false,
    intensity: 0.9,
  });
  const envCtl = useControls("Environment", {
    visible: true,
  });
  const skyCtl = useControls("Sky", {
    visible: false,
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

  return { envCtl, shadowCtl, dirLightCtl, ambientLightCtl, skyCtl };
}
