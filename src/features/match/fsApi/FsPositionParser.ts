export type Sign = -1 | 1 | "/";

export class FsPositionParser {
  // first value is ignored (saved to -1 index)
  private rIndex = -1;
  // current position
  private position = 0;
  // position delta or position repetition count
  private delta = 0;
  private lastSign: Sign = 1;
  private result: number[] = [];

  reset(): this {
    this.rIndex = -1;
    this.position = 0;
    this.delta = 0;
    this.lastSign = 1;
    this.result = [];
    return this;
  }

  parse(item: string): this {
    switch (item) {
      case "/": // guarda info
        return this.saveOrDuplicate("/");
      case "=": // guarda info
      case "+": // soma info + guarda
        return this.saveOrDuplicate(1);
      case "-":
        return this.saveOrDuplicate(-1);
      default:
        return this.appendDigit(Number(item));
    }
  }

  end(): this {
    return this.saveOrDuplicate("/");
  }

  getResult(): number[] {
    return this.result;
  }

  private appendDigit(digit: number) {
    this.delta = Number(this.delta.toString() + digit);
    return this;
  }

  private saveOrDuplicate(newSign: Sign) {
    if (this.lastSign !== "/") {
      this.saveNewPosition(this.lastSign);
    } else {
      this.duplicatePosition();
    }
    this.delta = 0;
    this.lastSign = newSign;
    return this;
  }

  //   private savePosition() {
  //     if (typeof this.lastSign !== "number") {
  //       throw new Error("lastSign is not number (case '/')");
  //     }
  //     this.saveNewPosition(this.lastSign);
  //     this.delta = 0;
  //     this.lastSign = "/";
  //   }
  private saveNewPosition(sign: 1 | -1) {
    this.position += this.delta * sign;
    this.putResult(this.rIndex++, this.position);
  }

  private duplicatePosition() {
    // let fss;
    // for (fss = this.rIndex; fss < this.rIndex + this.delta; fss++) {
    //   this.putResult(fss, this.position);
    // }
    // this.rIndex = fss;
    const max = this.rIndex + this.delta;
    while (this.rIndex < max) {
      this.putResult(this.rIndex++, this.position);
    }
  }
  private putResult(index: number, value: number) {
    // first value is ignores (has index -1)
    if (index < 0) return;
    this.result[index] = value;
  }
}
