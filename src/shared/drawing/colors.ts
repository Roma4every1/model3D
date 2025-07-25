import { round } from '../lib';


/**
 * Парсит HEX цвета в RGBA модель.
 * @example
 * parseColorHEX("#ccc") => [204, 204, 204, 1]
 * parseColorHEX("#123456") => [18, 52, 86, 1]
 * parseColorHEX("#00FF00FF") => [0, 255, 0, 1]
 * parseColorHEX("abc") => null
 */
export function parseColorHEX(hex: unknown): RGBA | null {
  if (typeof hex !== 'string') return null;
  if (hex.length !== 4 && hex.length !== 7 && hex.length !== 9) return null;
  let red: number, green: number, blue: number, alpha: number = 1;

  if (hex.length === 4) {
    red   = parseInt(hex[1] + hex[1], 16);
    green = parseInt(hex[2] + hex[2], 16);
    blue  = parseInt(hex[2] + hex[3], 16);
  } else {
    red   = parseInt(hex.slice(1, 3), 16);
    green = parseInt(hex.slice(3, 5), 16);
    blue  = parseInt(hex.slice(5, 7), 16);
  }
  if (hex.length === 9) {
    alpha = round(parseInt(hex.slice(7, 9), 16) / 255, 2);
  }
  return [red, green, blue, alpha];
}

/**
 * Сериализует RGBA-модель.
 * @example
 * stringifyRGBA([0, 0, 0, 1]) => "rgb(0,0,0)";
 * stringifyRGBA([8, 64, 8, 0.5]) => "rgba(8,64,8,0.5)";
 */
export function stringifyRGBA([red, green, blue, alpha]: RGBA): string {
  if (alpha === 1) {
    return `rgb(${red},${green},${blue})`;
  } else {
    return `rgba(${red},${green},${blue},${alpha})`;
  }
}

/**
 * Накладывает цвет на основной.
 * @deprecated Вероятно, эта функция работает неправильно
 * @example
 * overlayColor([0, 0, 0, 0.5], [255, 255, 255, 0.5]) => [170, 170, 170, 0.75]
 */
export function overlayColor(base: RGBA, additive: RGBA): RGBA {
  const baseAlpha = base[3];
  const addedAlpha = additive[3];
  if (!baseAlpha) return additive;
  if (!addedAlpha) return base;

  const alpha = 1 - (1 - addedAlpha) * (1 - baseAlpha);
  const additiveWeight = addedAlpha / alpha;
  const baseWeight = baseAlpha * (1 - baseAlpha) / alpha;

  const red   = Math.round(additive[0] * additiveWeight + base[0] * baseWeight);
  const green = Math.round(additive[1] * additiveWeight + base[1] * baseWeight);
  const blue  = Math.round(additive[2] * additiveWeight + base[2] * baseWeight);

  return [red, green, blue, alpha];
}
