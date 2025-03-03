import { Environment, Sky, useHelper } from "@react-three/drei";
import { useControls } from "leva";
import { MutableRefObject, Suspense, useRef } from "react";
import { CameraHelper, DirectionalLight, OrthographicCamera } from "three";
import { Match } from "../match/components/Match";
import { Stadium } from "./Stadium";
import { useAppZuStore } from "/app/app.zu.store";

export const World = () => {
  const { envCtl, dirLightCtl, ambientLightCtl, skyCtl } = useWorldCtls();
  const dirLight = useRef<DirectionalLight>(null);
  const isDebug = useAppZuStore(({ debug }) => debug.isDebug);

  const shadowCamera = useRef<OrthographicCamera>(null);
  useHelper(
    dirLightCtl.shadowCameraHelper &&
      (shadowCamera as MutableRefObject<OrthographicCamera>),
    CameraHelper
  );

  return (
    <>
      {envCtl.visible && (
        <Environment
          environmentIntensity={0}
          files={"models/potsdamer_platz_1k.hdr"}
          background={false}
          ground={{ height: 20, radius: 360, scale: 180 }}
        ></Environment>
      )}
      {/* {shadowCtl.visible && <ContactShadows {...shadowCtl} />} */}
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
          shadow-mapSize={[512, 512]}
        >
          <orthographicCamera
            ref={shadowCamera}
            attach={"shadow-camera"}
            args={[-52, 54, -36, 37]}
            far={dirLightCtl.shadowFar}
            near={dirLightCtl.shadowNear}
          />
        </directionalLight>
      )}

      <ambientLight {...ambientLightCtl} />
      {skyCtl.visible && <Sky />}
      <Suspense fallback={null}>
        <Stadium />
        <Match />
      </Suspense>
      {isDebug && dirLight.current && (
        <directionalLightHelper
          args={[dirLight.current, 2, 0xff0000]}
          visible={dirLight.current.visible && dirLightCtl.helper}
        />
      )}
    </>
  );
};

function useWorldCtls() {
  const dirLightCtl = useControls("Directional Light", {
    visible: true,
    position: { x: 0, y: 20, z: -2 },
    intensity: 1.2,
    helper: false,
    castShadow: true,
    shadowCameraHelper: false,
    shadowNear: 15,
    shadowFar: 24,
  });
  const ambientLightCtl = useControls("Ambient Light", {
    visible: true,
    intensity: 0.9,
  });
  const envCtl = useControls("Environment", {
    visible: true,
  });
  const skyCtl = useControls("Sky", {
    visible: false,
  });

  return { envCtl, dirLightCtl, ambientLightCtl, skyCtl };
}
