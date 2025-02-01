import { MathUtils } from "three";
import { PoseTypes, Writeable } from "./Pose.model";
import { PoseRecord } from "./PoseAction.model";
import { PoseBuilderContext } from "./PoseBuilderContext";
import { rotationAngle } from "./positions.utils";

const TURN_MIN_ANGLE = MathUtils.degToRad(15);

export class PlayerDirectionBuilder {
  constructor(private ctx: PoseBuilderContext) {}

  public calculateDirection(): void {
    const { pose, prev } = this.ctx;
    pose.direction = this.directionAngle();
    if (prev.pose) {
      pose.lastDirection = prev.pose.direction;
      pose.rotation = rotationAngle(pose.lastDirection, pose.direction);
    }
    this.tryUseTurnPose(pose);
    this.ctx.savePlayerDirection(pose.direction);
  }

  /**
   * Calculates the direction angle for the player based on the current pose.
   * @returns The direction angle in degrees.
   */
  private directionAngle(): number {
    switch (this.ctx.pose.type) {
      case PoseTypes.pass:
      case PoseTypes.shot:
      case PoseTypes.head:
        return this.directionTowardsBall();

      case PoseTypes.idle:
        return this.directionTowardsBall();

      case PoseTypes.throwIn:
        return this.directionTowardsPitch();

      case PoseTypes.walk:
      case PoseTypes.run:
        if (this.ctx.pose.playerSpeed < 3) {
          return this.syncDirectionWithBall();
        }
        return this.directionOfMovement();
      // case PoseTypes.leftTurn:
      // case PoseTypes.rightTurn:
      // case PoseTypes.jogLeft:
      // case PoseTypes.jogRight:
      // case PoseTypes.walkBack:
      default:
        return this.directionOfMovement();
    }
  }
  private directionTowardsPitch(): number {
    return this.ctx.next.playerPos.direction2DRaw(this.ctx.next.playerPos.x, 0);
  }

  private directionOfMovement(): number {
    return this.ctx.playerPos.direction2D(this.ctx.next.playerPos);
  }

  private directionTowardsBall(): number {
    return this.ctx.playerPos.direction2D(this.ctx.ballPos);
  }

  /**
   * Synchronizes the player's direction with the ball's position and updates the player's pose accordingly.
   * @returns The direction angle in degrees.
   */
  private syncDirectionWithBall(): number {
    const dirOfMove = this.directionOfMovement();
    const dirToBall = this.directionTowardsBall();
    const moveToBallAngle = rotationAngle(dirOfMove, dirToBall);
    const pose = this.ctx.pose;
    // ball is behind
    if (Math.abs(moveToBallAngle) >= MathUtils.degToRad(120)) {
      pose.type = pose.playerSpeed < 1 ? PoseTypes.walkBack : PoseTypes.jogBack;
      return dirToBall;
    }

    // ball is on the left
    if (moveToBallAngle > MathUtils.degToRad(60)) {
      pose.type = PoseTypes.jogLeft;
      return dirToBall;
    }
    // ball is on the right
    if (moveToBallAngle < MathUtils.degToRad(-60)) {
      pose.type = PoseTypes.jogRight;
      return dirToBall;
    }
    return dirOfMove;
  }

  /**
   * Attempts to update the pose to a turning pose based on the rotation angle.
   * If the pose type is idle and the rotation angle exceeds the minimum turn angle,
   * the pose type is updated to either a left turn or right turn.
   *
   * @param pose - The pose record to be potentially updated. Must be a writable PoseRecord.
   */
  private tryUseTurnPose(pose: Writeable<PoseRecord>): void {
    if (
      pose.type === PoseTypes.idle
      //       || (poseRecord.type === PoseTypes.walk && poseRecord.playerSpeed < 0.4)
    ) {
      if (pose.rotation < -TURN_MIN_ANGLE) {
        pose.type = PoseTypes.leftTurn;
        pose.timeScale = 1;
      } else if (pose.rotation > TURN_MIN_ANGLE) {
        pose.type = PoseTypes.rightTurn;
        pose.timeScale = 1;
      }
    }
  }
}
