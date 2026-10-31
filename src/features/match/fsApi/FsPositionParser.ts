import { MATCH_TIME_SCALE } from "../animations/positions.utils";

export type Sign = -1 | 1 | "/";

// Support 120 minutes of play plus up to 60 minutes of stoppages/penalties.
// At one sample per 0.5 seconds this bounds each coordinate stream to 21,600
// entries, cumulatively across every game_data record passed to this parser.
const MAX_DECODED_POSITIONS = (180 * 60) / MATCH_TIME_SCALE;

export class FsPositionParser {
  // first value is ignored (saved to -1 index)
  private rIndex = -1;
  // current position
  private position = 0;
  // position delta or position repetition count
  private delta = 0;
  private hasDigits = false;
  private lastSign: Sign = 1;
  private result: number[] = [];

  reset(): this {
    this.rIndex = -1;
    this.position = 0;
    this.delta = 0;
    this.hasDigits = false;
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
        if (!/^[0-9]$/.test(item)) {
          throw new Error("Invalid movement data: expected a decimal digit");
        }
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
    const delta = this.delta * 10 + digit;
    if (!Number.isSafeInteger(delta) || delta < 0) {
      throw new Error("Invalid movement data: count or delta must be a nonnegative safe integer");
    }
    this.delta = delta;
    this.hasDigits = true;
    return this;
  }

  private saveOrDuplicate(newSign: Sign) {
    if (this.lastSign !== "/") {
      this.saveNewPosition(this.lastSign);
    } else {
      this.duplicatePosition();
    }
    this.delta = 0;
    this.hasDigits = false;
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
    if (this.rIndex >= MAX_DECODED_POSITIONS) {
      throw new Error("Invalid movement data: decoded position limit exceeded (180 minutes)");
    }
    this.position += this.delta * sign;
    this.putResult(this.rIndex++, this.position);
  }

  private duplicatePosition() {
    if (!this.hasDigits || !Number.isSafeInteger(this.delta) || this.delta < 0) {
      throw new Error("Invalid movement data: repeat count must be a nonnegative safe integer");
    }
    // Check the entire run before entering the loop or writing any entries.
    if (this.delta > MAX_DECODED_POSITIONS - this.rIndex) {
      throw new Error("Invalid movement data: decoded position limit exceeded (180 minutes)");
    }
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
