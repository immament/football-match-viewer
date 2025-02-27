import { PoseRecord } from "./animations/player/PoseAction.model";

export interface ILabelUpdater {
  updateLabel(text?: string): void;
  createLabelText(
    pose: PoseRecord | undefined,
    mixerTime: number
  ): string | undefined;
}
