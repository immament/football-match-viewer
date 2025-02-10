import { useFrame, useThree } from "@react-three/fiber";
import { MutableRefObject, useEffect, useMemo, useState } from "react";
import { Group, Mesh, Object3D } from "three";
import { OrbitControls } from "three-stdlib";
import { ViewFromTarget } from "./ViewFromTarget";
import { useAppZuStore } from "/app/app.zu.store";
import { FOLLOW_BALL_IDX } from "/app/Camera.slice";

export function useMatchOrbitControls(
  ballRef: MutableRefObject<Mesh | null>,
  matchRef: MutableRefObject<Group | null>
) {
  const domElement = useThree((state) => state.gl.domElement);
  const defaultCamera = useThree((state) => state.camera);

  const [controls, setControls] = useState<OrbitControls>();
  useEffect(() => {
    if (defaultCamera && domElement && !controls) {
      const ctls = new OrbitControls(defaultCamera, domElement);
      ctls.enableDamping = true;
      ctls.listenToKeyEvents(document.body);
      ctls.maxPolarAngle = Math.PI / 2 - 0.01;
      ctls.minDistance = 0.4;
      ctls.maxDistance = 120;
      ctls.zoomSpeed = 2;
      setControls(ctls);
      // return ctls;
    }
  }, [controls, defaultCamera, domElement]);

  const followedObjectId = useAppZuStore((st) => st.camera.followedObjectId);
  const viewFromObject = useAppZuStore((st) => st.camera.viewFromObject);
  const [followedObject, setFollowedObject] = useState<Object3D>();
  const viewfromTarget = useMemo<ViewFromTarget>(
    () => new ViewFromTarget(),
    []
  );

  useEffect(() => {
    let object = undefined;
    if (followedObjectId === FOLLOW_BALL_IDX) {
      object = ballRef.current;
    } else if (
      matchRef.current &&
      followedObjectId >= 1 &&
      followedObjectId <= 22
    ) {
      object = matchRef.current.getObjectByName(
        toPlayerObjectName(followedObjectId - 1)
      )?.parent;
    }
    setFollowedObject(object ?? undefined);
  }, [followedObjectId, matchRef, ballRef]);

  useEffect(() => {
    viewfromTarget.enabled = viewFromObject;
  }, [viewFromObject, viewfromTarget]);

  useFrame(() => {
    if (!controls?.enabled) return;
    if (followedObject) {
      if (viewFromObject) {
        viewfromTarget.update(followedObject, controls.object, controls.target);
      } else {
        controls.target.set(
          followedObject.position.x,
          (followedObject.position.y + 4) / 4,
          followedObject.position.z
        );
      }
    }
    controls.update();
  });

  return controls;
}

// helpers
// TODO: Move to utils
// index from 0-21
function toPlayerObjectName(index: number) {
  return `Player-${toTeamIdx(index)}-${toPlayerIdx(index)}`;
}
// index from 0-21
function toTeamIdx(index: number) {
  return Math.floor(index / 11);
}
// index from 0-21
function toPlayerIdx(index: number) {
  return index % 11;
}
