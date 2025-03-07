export class PlayerId {
  public get teamIdx(): number {
    return this._teamIdx;
  }
  public get playerIdx(): number {
    return this._playerIdx;
  }
  constructor(
    private readonly _teamIdx: number,
    private readonly _playerIdx: number
  ) {}
}
