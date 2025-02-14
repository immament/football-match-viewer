import { Color } from "./Color";

export class KitColorsVo {
  public shirt(): Color {
    return this._shirt;
  }
  public text(): Color {
    return this._text;
  }

  constructor(private _shirt: Color, private _text: Color) {}

  private static readonly DEFAULT_RANDOM_ID = 300;
  private static readonly SHIRT_SIMILARITY_LEVEL = 25;
  private static readonly TEXT_SIMILARITY_LEVEL = 40;

  static random(seedId: number) {
    const shirtColor = Color.generateColor(
      seedId * KitColorsVo.DEFAULT_RANDOM_ID
    );
    return this.createForShirtColor(shirtColor, seedId);
  }

  static createForShirtColor(
    shirtColor: Color,
    randomId?: number,
    textColor: Color = new Color("FFFFFF")
  ) {
    return new KitColorsVo(
      shirtColor,
      shirtColor.generateSinceDiffrent(
        textColor,
        randomId,
        KitColorsVo.TEXT_SIMILARITY_LEVEL
      )
    );
  }

  fixIfSimilar(kit: KitColorsVo, randomId?: number) {
    if (this.isSimilar(kit)) {
      const newColor = this._shirt.generateSinceDiffrent(undefined, randomId);
      return KitColorsVo.createForShirtColor(newColor, randomId);
    }
    return this;
  }

  private isSimilar(kit: KitColorsVo) {
    return (
      this._shirt.colorDelta(kit.shirt()) < KitColorsVo.SHIRT_SIMILARITY_LEVEL
    );
  }

  getProps(): KitColorsDTO {
    return { shirt: this._shirt.hex(), text: this._text.hex() };
  }
}

export type KitColorsDTO = { shirt: string; text: string };
