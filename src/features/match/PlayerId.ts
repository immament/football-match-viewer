export class PlayerId {
  public get teamIdx(): number {
    return this._teamIdx;
  }
  public get playerIdx(): number {
    return this._playerIdx;
  }
  public readonly randId = Math.random();

  constructor(
    private readonly _teamIdx: number,
    private readonly _playerIdx: number
  ) {}

  isPlayer(aTeamIdx: number, aPlayerIdx: number) {
    return aTeamIdx === this._teamIdx && aPlayerIdx === this.playerIdx;
  }

  get isDebugPlayer() {
    return this._teamIdx === 0 && this.playerIdx === 7;
  }
}
