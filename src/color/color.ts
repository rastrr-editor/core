import type {Color as AbstractColor, ColorRange} from "./interface";

export default class Color implements AbstractColor {
    constructor(public r: ColorRange, public g: ColorRange, public b: ColorRange, public a: ColorRange = 255) {
    }
}