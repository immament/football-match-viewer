import { StateCreator } from "zustand";
import { AppStoreState } from "./app.zu.store";

export interface CameraSlice {
  camera: {
    followedObjectId: number;
    viewFromObject: boolean;
    changeFollowedObjectId: (followedObjectId: number) => void;
    changeViewFromObject: (viewFromObject: boolean) => void;
  };
}

export const FOLLOW_BALL_IDX = 23;

export const createCameraSlice: StateCreator<
  AppStoreState,
  [["zustand/immer", never]],
  [],
  CameraSlice
> = (set) => ({
  camera: {
    followedObjectId: FOLLOW_BALL_IDX,
    viewFromObject: false,
    changeFollowedObjectId: (followedObjectId: number) => {
      set((state) => {
        state.camera.followedObjectId = followedObjectId;
      });
    },
    changeViewFromObject: (viewFromObject: boolean) => {
      set((state) => {
        state.camera.viewFromObject = viewFromObject;
      });
    },
  },
});
