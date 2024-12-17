import { chunk, cloneDeep } from 'lodash';
import { fillPatterns } from 'shared/drawing';
import { signProvider } from '../drawer/sign-provider';
import linesDefStub from '../drawer/lines.def.stub.json';

import {
  getPolylineBounds, getLabelBounds, getSignBounds,
  getPieSliceBounds, getFieldBounds
} from '../lib/bounds';


export async function prepareMapElements(elements: MapElement[]): Promise<void> {
  if (elements.length === 0) return;
  const type = elements[0].type;

  if (type === 'polyline') {
    elements.forEach(preparePolyline);
  } else if (type === 'label') {
    elements.forEach(prepareLabel);
  } else if (type === 'sign') {
    for (const element of elements) await prepareSign(element as MapSign);
  } else if (type === 'pieslice') {
    elements.forEach(preparePieSlice);
  } else if (type === 'field') {
    elements.forEach(prepareField);
  }
}

function preparePolyline(p: MapPolyline): void {
  if (p.fillname) {
    const background = p.transparent
      ? 'none'
      : (p.fillbkcolor === 'background' ? '#ffffff' : p.fillbkcolor);
    p.fillStyle = fillPatterns.createFillStyle(p.fillname, p.fillcolor, background);
  }
  if (p.borderstyleid) p.style = linesDefStub[p.borderstyleid];
  if (!p.bounds) p.bounds = getPolylineBounds(p);
}

function prepareLabel(label: MapLabel): void {
  label.bounds = getLabelBounds(label);
}

async function prepareSign(sign: MapSign): Promise<void> {
  sign.img = await signProvider.getImage(sign.fontname, sign.symbolcode, sign.color);
  sign.bounds = getSignBounds(sign);
}

function preparePieSlice(pie: MapPieSlice): void {
  pie.bounds = getPieSliceBounds(pie);
}

/* --- Field Preparation --- */

function prepareField(field: MapField): void {
  field.sourceRenderDataMatrix = chunk(parseFieldData(field.data), field.sizex);
  field.deltasPalette = getDeltasPalette(field.palette.level);
  field.preCalculatedSpectre = getDeltasPreCalculatedPalettes(field.deltasPalette);
  field.lastUsedPalette = cloneDeep(field.palette);
  field.bounds = getFieldBounds(field);
}

export function getDeltasPreCalculatedPalettes(palettes: any[], spectreArrayLength = 10000): any {
  const spectreArray = [];
  const absoluteMin = +palettes[0].min;
  const absoluteMax = +palettes[palettes.length - 1].max;
  const absoluteMinPalette = palettes[0];
  const absoluteMaxPalette = palettes[palettes.length - 1];

  const absoluteMinValue = {
    r: absoluteMinPalette.redStart,
    g: absoluteMinPalette.greenStart,
    b: absoluteMinPalette.blueStart,
  };
  const absoluteMaxValue = {
    r: absoluteMaxPalette.redStart + absoluteMaxPalette.redDelta,
    g: absoluteMaxPalette.greenStart + absoluteMaxPalette.greenDelta,
    b: absoluteMaxPalette.blueStart + absoluteMaxPalette.blueDelta,
  };

  const absoluteDelta = absoluteMax - absoluteMin;
  const step = absoluteDelta / spectreArrayLength;
  let value = absoluteMin;

  for (let i = 0; i < spectreArrayLength; i++) {
    value += step;
    for (let j = 0; j < palettes.length; j++) {
      const currentPalette = palettes[j];
      if (value >= currentPalette.min && value < currentPalette.max) {
        const valueDelta = value - currentPalette.min;
        const deltaCoefficient = valueDelta / currentPalette.delta;

        const r = currentPalette.redStart + Math.round(currentPalette.redDelta * deltaCoefficient);
        const g = currentPalette.greenStart + Math.round(currentPalette.greenDelta * deltaCoefficient);
        const b = currentPalette.blueStart + Math.round(currentPalette.blueDelta * deltaCoefficient);

        spectreArray.push({r, g, b});
        continue;
      }
      if (value >= absoluteMax) spectreArray.push(absoluteMaxValue);
      if (value < absoluteMin) spectreArray.push(absoluteMinValue);
    }
  }
  return {
    spectreArray, absoluteMin, absoluteMinValue, absoluteMax, absoluteMaxValue,
    deltaCoefficient: spectreArrayLength / absoluteDelta,
  };
}

export function getDeltasPalette(palette: MapFieldPaletteLevel[]): any[] {
  return getRgbPaletteFromHex(palette)
    .sort((a, b) => (a.value - b.value))
    .reduce((acc, item, index, arr) => {
      if (index !== arr.length - 1) {
        return acc.concat({
          min: item.value,
          max: arr[index + 1].value,
          delta: arr[index + 1].value - item.value,
          redStart: item.red,
          greenStart: item.green,
          blueStart: item.blue,
          redDelta: arr[index + 1].red - item.red,
          greenDelta: arr[index + 1].green - item.green,
          blueDelta: arr[index + 1].blue - item.blue
        });
      }
      return acc;
    }, []);
}

function getRgbPaletteFromHex(hexPalette: MapFieldPaletteLevel[]): any {
  return hexPalette.map((item) => {
    let hexColorsArr = chunk(item.color.slice(1).split(''), 2).map((i) => i.join(''));
    return {
      hexColor: item.color,
      value: item.value,
      red: parseInt(hexColorsArr[0], 16),
      green: parseInt(hexColorsArr[1], 16),
      blue: parseInt(hexColorsArr[2], 16)
    };
  });
}

/**
 * Преобразует строку вида `123 n*50 321 ...` в массив чисел.
 * Элемент вида `n*50` означает повторение null 50 раз.
 */
function parseFieldData(source: string): number[] {
  const data: number[] = [];
  const values = source.split(' ');

  for (let value of values) {
    const starIndex = value.indexOf('*');
    if (starIndex === -1) { data.push(Number(value)); continue; }

    const count = Number.parseInt(value.substring(starIndex + 1));
    value = value.substring(0, starIndex);
    const dataValue = value === 'n' ? null : Number(value);
    for (let i = count; i > 0; --i) data.push(dataValue);
  }
  return data;
}
