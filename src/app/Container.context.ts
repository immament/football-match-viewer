import { createContext } from "react";

export type ContainerContextProps = {
  // world?: HTMLElement;
  mediaPlayer: HTMLElement;
  // root?: HTMLElement;
  debugMode: boolean;
};

export const ContainerContext = createContext<
  ContainerContextProps | undefined
>(undefined);
