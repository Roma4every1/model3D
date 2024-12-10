import { chunk, cloneDeep } from 'lodash';
import { fillPatterns } from 'shared/drawing';
import { signProvider } from '../drawer/sign-provider';
import linesDefStub from '../drawer/lines.def.stub.json';


export async function prepareMapElements(elements: MapElement[]): Promise<void> {
  if (elements.length === 0) return;
  const type = elements[0].type;

  if (type === 'polyline') {
    elements.forEach(preparePolyline);
  } else if (type === 'sign') {
    for (const element of elements) await prepareSign(element as MapSign);
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
  if (p.borderstyleid) {
    p.style = linesDefStub[p.borderstyleid];
  }
}

async function prepareSign(sign: MapSign): Promise<void> {
  sign.img = await signProvider.getImage(sign.fontname, sign.symbolcode, sign.color);
}

/* --- Field Preparation --- */

function prepareField(field: MapField): void {
  field.sourceRenderDataMatrix = chunk(parseSourceRenderData(field.data), field.sizex);
  field.deltasPalette = getDeltasPalette(field.palette.level);
  field.preCalculatedSpectre = getDeltasPreCalculatedPalettes(field.deltasPalette);
  field.lastUsedPalette = cloneDeep(field.palette);
  field.bounds = fieldBounds(field);
}

function fieldBounds(field: MapField): Bounds {
  return {
    min: {x: field.x, y: field.y - field.sizey * field.stepy},
    max: {x: field.x + field.sizex * field.stepx, y: field.y},
  };
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

function parseSourceRenderData(stringData: string): number[] {
  // parse string "n*50 123.123 132.323 ..." to an array (n*50 is equal to repeating null 50 times)
  let data = stringData.split(' ');
  let ret = [];
  for (let i = 0; i < data.length; i++) {
    let val = data[i];
    let starIndex = val.indexOf('*');
    if (starIndex === -1) {
      ret.push(+val);
    } else {
      let arr = val.split('*');
      let valToPush = (arr[0] === 'n') ? null : (+arr[0]);
      let counter = +arr[1];
      for (let j = counter; j > 0; j--) {
        ret.push(valToPush);
      }
    }
  }
  return ret;
}
