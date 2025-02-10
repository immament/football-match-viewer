export class Color {
  private static readonly DEFAULT_RANDOM_ID = 400;
  private static readonly SIMILARITY_LEVEL = 25;

  private _hex: string;

  constructor(aHex: string) {
    this._hex = aHex.replace("#", "") || "FFFFFF";
  }

  hex() {
    return "#" + this._hex;
  }

  rgb(): Rgb {
    return {
      r: parseInt(this._hex.substring(0, 2), 16),
      g: parseInt(this._hex.substring(2, 4), 16),
      b: parseInt(this._hex.substring(4, 6), 16),
    };
  }

  colorDelta(color2: Color) {
    return Color.deltaE(this.lab(), color2.lab());
  }

  generateSinceDiffrent(
    aNewColor: Color | undefined,
    aRrandomId?: number,
    similarityLevel = Color.SIMILARITY_LEVEL
  ): Color {
    if (!aNewColor || this.colorDelta(aNewColor) < similarityLevel) {
      return this.generateSinceDiffrent(
        Color.generateColor(
          (aRrandomId ?? Color.randomId()) * Color.DEFAULT_RANDOM_ID
        ),
        aRrandomId ? aRrandomId * 1.5 : undefined,
        similarityLevel
      );
    }
    return aNewColor;
  }

  static generateColor(seedId: number) {
    let color = seedId.toString(16).substring(0, 6);
    while (color.length < 6) color += "0";
    return new Color(color);
  }

  static randomId() {
    return Math.round(Math.random() * 10000) + 300;
  }

  lab() {
    const rgb = this.rgb();
    let r = rgb.r / 255,
      g = rgb.g / 255,
      b = rgb.b / 255;
    let x, y, z;

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
  }

  static deltaE(labA: number[], labB: number[]): number {
    const deltaL = labA[0] - labB[0];
    const deltaA = labA[1] - labB[1];
    const deltaB = labA[2] - labB[2];
    const c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
    const c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
    const deltaC = c1 - c2;
    let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
    const sc = 1.0 + 0.045 * c1;
    const sh = 1.0 + 0.015 * c1;
    const deltaLKlsl = deltaL / 1.0;
    const deltaCkcsc = deltaC / sc;
    const deltaHkhsh = deltaH / sh;
    const i =
      deltaLKlsl * deltaLKlsl +
      deltaCkcsc * deltaCkcsc +
      deltaHkhsh * deltaHkhsh;
    return i < 0 ? 0 : Math.sqrt(i);
  }
}

export interface Rgb {
  r: number;
  g: number;
  b: number;
}
