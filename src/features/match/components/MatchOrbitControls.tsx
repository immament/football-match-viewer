import { useFrame, useThree } from "@react-three/fiber";
import { MutableRefObject, useEffect, useRef } from "react";
import { Group, Mesh, Object3D, Vector3 } from "three";
import { OrbitControls } from "three-stdlib";
import { ViewFromTarget } from "../ViewFromTarget";
import { useAppZuStore } from "/app/app.zu.store";
import { FOLLOW_BALL_IDX } from "/app/Camera.slice";

export function useMatchOrbitControls(
  ballRef: MutableRefObject<Mesh | null>,
  matchRef: MutableRefObject<Group | null>
) {
  const domElement = useThree((state) => state.gl.domElement);
  const defaultCamera = useThree((state) => state.camera);

  const controls = useRef<OrbitControls>();
  useEffect(() => {
    if (defaultCamera && domElement && !controls.current) {
      const ctls = new OrbitControls(defaultCamera, domElement);
      ctls.enableDamping = true;
      ctls.listenToKeyEvents(document.body);
      ctls.maxPolarAngle = Math.PI / 2 - 0.01;
      ctls.minDistance = 0.4;
      ctls.maxDistance = 110;
      ctls.zoomSpeed = 2;
      controls.current = ctls;
      // return ctls;
    }
  }, [defaultCamera, domElement]);

  const followedObjectId = useAppZuStore((st) => st.camera.followedObjectId);
  const viewFromObject = useAppZuStore((st) => st.camera.viewFromObject);
  const followedObject = useRef<Object3D>();
  const viewfromTarget = useRef<ViewFromTarget>(new ViewFromTarget());
  const tmpTargetRef = useRef(new Vector3());

  useEffect(() => {
    setFollowedObject();

    function setFollowedObject() {
      let obj = undefined;
      if (followedObjectId === FOLLOW_BALL_IDX) {
        obj = ballRef.current;
        if (!obj) {
          setTimeout(() => setFollowedObject(), 200);
        }
      } else if (
        matchRef.current &&
        followedObjectId >= 1 &&
        followedObjectId <= 22
      ) {
        obj = matchRef.current.getObjectByName(
          toPlayerObjectName(followedObjectId - 1)
        )?.parent;
      }
      followedObject.current = obj ?? undefined;
    }
  }, [followedObjectId, ballRef, matchRef]);

  useEffect(() => {
    viewfromTarget.current.enabled = viewFromObject;
    if (controls.current) {
      controls.current.enableZoom =
        !viewFromObject ||
        followedObjectId === FOLLOW_BALL_IDX ||
        !followedObjectId;
    }
  }, [viewFromObject, followedObjectId]);

  useFrame((_, delta) => {
    if (!controls.current) return;
    if (followedObject.current) {
      if (viewFromObject) {
        viewfromTarget.current.update(
          followedObject.current,
          controls.current.object,
          controls.current.target,
          controls.current,
          delta
        );
      } else {
        tmpTargetRef.current.set(
          followedObject.current.position.x,
          (followedObject.current.position.y + 4) / 4,
          followedObject.current.position.z
        );
        controls.current.target.lerp(
          tmpTargetRef.current,
          Math.min(1, delta * 2)
        );
      }
    }
    controls.current.update();
  });
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
