import { cloneDeep, isEqual } from 'lodash';
import { getDeltasPreCalculatedPalettes, getDeltasPalette } from '../loader/prepare';


export class FieldDrawer implements MapElementDrawer<MapField> {
  public draw(i: MapField, options: MapDrawOptions): void {
    if (!isEqual(i.palette.level, i.lastUsedPalette.level)) {
      i.deltasPalette = getDeltasPalette(i.palette.level);
      i.preCalculatedSpectre = getDeltasPreCalculatedPalettes(i.deltasPalette);
    }
    i.lastUsedPalette = cloneDeep(i.palette);

    const ctx = options.ctx;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const imageData = ctx.createImageData(width, height);

    let pixelIndex = 0;
    for (let dy = 0; dy < height; ++dy) {
      const arrayX: number[] = [];
      const y = options.toMapPoint({x: 0, y: dy}).y;

      for (let dx = 0; dx < width; ++dx) {
        const x = options.toMapPoint({x: dx,y: 0}).x;
        arrayX.push(x);
      }

      const valuesArray = this.getInterpolatedArrayValues(i, arrayX, y);
      for (let value of valuesArray) {
        if (value === null || value === undefined || isNaN(value)) {
          pixelIndex += 4;
          continue;
        }
        const pixelColor = i.palette.interpolated
          ? this.getPixelColorInterpolated(value, i)
          : this.getPixelColor(value, i);

        imageData.data[pixelIndex++] = pixelColor.r;
        imageData.data[pixelIndex++] = pixelColor.g;
        imageData.data[pixelIndex++] = pixelColor.b;
        imageData.data[pixelIndex++] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  private getPixelColor(value: number | null, i: MapField): any {
    if (value === null) return {r: 255, g: 255, b: 255};
    if (value <= i.deltasPalette[0].min) return {
      r: i.deltasPalette[0].redStart,
      g: i.deltasPalette[0].greenStart,
      b: i.deltasPalette[0].blueStart,
    };
    const lastDeltasPalette = i.deltasPalette[i.deltasPalette.length - 1];
    if (value >= lastDeltasPalette.max) return {
      r: lastDeltasPalette.redStart + lastDeltasPalette.redDelta,
      g: lastDeltasPalette.greenStart + lastDeltasPalette.greenDelta,
      b: lastDeltasPalette.blueStart + lastDeltasPalette.blueDelta,
    };
    for (let delta of i.deltasPalette) {
      if (value >= delta.min && value < delta.max) {
        return {r: delta.redStart, g: delta.greenStart, b: delta.blueStart};
      }
    }
    return {r: 255, g: 255, b: 255};
  }

  private getPixelColorInterpolated(value: number | null, i: MapField): any {
    if (value === null) return {r: 255, g: 255, b: 255};
    if (value <= i.preCalculatedSpectre.absoluteMin) return i.preCalculatedSpectre.absoluteMinValue;
    if (value >= i.preCalculatedSpectre.absoluteMax) return i.preCalculatedSpectre.absoluteMaxValue;
    const valueDelta = value - i.preCalculatedSpectre.absoluteMin;
    const spectreIndex = Math.floor(valueDelta * i.preCalculatedSpectre.deltaCoefficient);
    return i.preCalculatedSpectre.spectreArray[spectreIndex];
  }

  private getInterpolatedArrayValues(i: MapField, arrayX: number[], y: number): any[] {
    const resultArray = [];
    if (y === undefined || Number.isNaN(y)) return [...Array(arrayX.length).fill(null)];

    const maxY = i.y;
    const minY = maxY - (i.sizey - 1) * i.stepy;
    if (y < minY || maxY < y) return [...Array(arrayX.length).fill(null)];

    const sY = 1 / i.stepy;
    const sX = 1 / i.stepx;

    const relativeToFieldY = maxY - y;
    const relativeToCellY = ((relativeToFieldY % i.stepy) * sY); // 1*
    const i1 = Math.floor(relativeToFieldY * sY); // 1*

    if (i1 >= i.sizey || i1 < 0 || i1 >= (i.sourceRenderDataMatrix.length-1)) {
      return [...Array(arrayX.length).fill(null)];
    }
    for (let x of arrayX) {
      const minX = i.x;
      const maxX = minX + (i.sizex - 1) * i.stepx;

      if (x < minX || maxX < x) {
        resultArray.push(null);
        continue;
      }

      const relativeToFieldX = x - minX;
      const j1 = Math.floor(relativeToFieldX * sX); // 1*

      if (j1 >= i.sizex || j1 < 0 || j1 >= i.sourceRenderDataMatrix[0].length) {
        resultArray.push(null);
        continue;
      }

      const f00 = i.sourceRenderDataMatrix[i1][j1]
      const f10 = i1+1 === i.sizey ? null : i.sourceRenderDataMatrix[i1 + 1][j1];
      const f01 = j1+1 === i.sizex ? null : i.sourceRenderDataMatrix[i1][j1 + 1]
      const f11 = (i1+1 === i.sizex) && (j1+1 === i.sizey)
        ? null
        : i.sourceRenderDataMatrix[i1 + 1][j1 + 1]

      let s = 0;
      if (f00 != null) s++;
      if (f10 != null) s++;
      if (f01 != null) s++;
      if (f11 != null) s++;
      if (s <= 2) { resultArray.push(null); continue; }

      const relativeToCellX = ((relativeToFieldX % i.stepx) * sX); // 1*
      const compositionXY = relativeToCellX * relativeToCellY; // 1*

      if (s === 3) {
        if (f00 == null) {
          let a = 1 - relativeToCellX;
          let b = 1 - relativeToCellY;
          let c = 1 - a - b;
          if (c < 0) { resultArray.push(null); continue; }
          resultArray.push(a * f10 + b * f01 + c * f11);
          continue;
        }
        if (f01 == null) {
          let a = relativeToCellX;
          let b = 1 - relativeToCellY;
          let c = 1 - a - b;
          if (c < 0) { resultArray.push(null); continue; }
          resultArray.push(a * f11 + b * f00 + c * f10);
          continue;
        }
        if (f10 == null) {
          let a = (1 - relativeToCellX);
          let b = relativeToCellY;
          let c = 1 - a - b;
          if (c < 0) {
            resultArray.push(null);
            continue;
          }
          resultArray.push(a * f00 + b * f11 + c * f01);
          continue;
        }
        if (f11 == null) {
          let a = relativeToCellX;
          let b = relativeToCellY;
          let c = 1 - a - b;
          if (c < 0) { resultArray.push(null); continue; }
          resultArray.push(a * f01 + b * f10 + c * f00);
          continue;
        }
      }

      // f(x) == f[0][0] * (1-x)(1-y) + f[1][0] * x(1-y) + f[0][1] * (1-x)y + f[1][1] * (1-x)(1-y)
      const comp1 = 1 - relativeToCellX - relativeToCellY + compositionXY;
      const comp2 = relativeToCellX - compositionXY;
      const comp3 = relativeToCellY - compositionXY;
      resultArray.push((f00 * comp1 + f01 * comp2 + f10 * comp3 + f11 * compositionXY) || null);
    }
    return resultArray;
  }
}
