import { getLabelTextNumberArray } from './label-text-parser';


export class LabelDrawer implements MapElementDrawer<MapLabel> {
  public draw(label: Readonly<MapLabel>, options: MapDrawOptions): void {
    const ctx = options.ctx;
    const dotsPerMeter = options.dotsPerMeter;

    // pt -> meters -> pixels
    const fontsize = (label.fontsize + (label.selected ? 2 : 0)) * (4 / 3) * window.devicePixelRatio;
    if (fontsize < 2) return;
    const font = fontsize + 'px "' + label.fontname + '"';

    ctx.font = font;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.beginPath();

    const text = (x: number, y: number) => {
      const numbersArray = getLabelTextNumberArray(label.text);
      const indexFontSize = fontsize * 2 / 3;

      // если хотябы у одного из чисел в массиве есть индекс
      const hasIndexes = numbersArray.some(n => n.lower || n.upper);
      // (h[lowerIndex] + h[upperIndex] - h[number]) / 2
      const indexOffset = (indexFontSize * 2 - fontsize) / 2;
      const indexFont = indexFontSize + 'px ' + label.fontname;

      // подсчет ширины текста с учетом индексов
      let width = 0;
      if (hasIndexes) {
        for (let j = 0; j < numbersArray.length; j++) {
          width += ctx.measureText(numbersArray[j].value).width;

          // считаем ширину индексов с учетом размера шрифта, если есть оба индекса то берем большую ширину
          ctx.font = indexFont;
          let lowerWidth = 0, upperWidth = 0;
          if (numbersArray[j].upper) upperWidth = ctx.measureText(numbersArray[j].upper).width;
          if (numbersArray[j].lower) lowerWidth = ctx.measureText(numbersArray[j].lower).width;
          ctx.font = font;
          width += Math.max(lowerWidth, upperWidth);
        }
      } else {
        width = ctx.measureText(label.text).width;
      }

      if (label.halignment === 2) {
        x -= width + 2;
      } else if (label.halignment === 1) {
        x -= width / 2 + 1;
      }
      if (label.valignment === 0) {
        y -= fontsize + 2;
      } else if (label.valignment === 1) {
        y -= fontsize / 2 + 1;
      }

      const fillStyle = label.color === '#ffffff' ? 'black' : label.color;
      ctx.fillStyle = fillStyle;

      if (hasIndexes) {
        let newX = x;

        for (let j = 0; j < numbersArray.length; j++) {
          // отрисовка числа
          let textWidth = ctx.measureText(numbersArray[j].value).width;
          // отрисовка фоновой затирки
          if (!label.transparent) {
            ctx.fillStyle = 'white';
            ctx.fillRect(newX, y, textWidth, fontsize + 3);
            ctx.fillStyle = fillStyle;
          }
          ctx.fillText(numbersArray[j].value, newX, y + 1.5);
          newX += textWidth;

          const upper = numbersArray[j].upper;
          const lower = numbersArray[j].lower;

          // отрисовка верхних индексов этого числа
          let upperWidth = 0;
          if (upper) {
            const upperY = y - indexOffset;
            ctx.font = indexFont;
            upperWidth = ctx.measureText(upper).width;
            // отрисовка фоновой затирки
            if (!label.transparent) {
              ctx.fillStyle = 'white';
              ctx.fillRect(newX, upperY - 1, upperWidth, indexFontSize + 2);
              ctx.fillStyle = fillStyle;
            }
            ctx.fillStyle = fillStyle;
            ctx.fillText(upper, newX, upperY);
            ctx.font = font;
          }

          // отрисовка нижних индексов этого числа
          let lowerWidth = 0;
          if (lower) {
            const lowerY = y + fontsize + indexOffset - indexFontSize;
            ctx.font = indexFont;
            lowerWidth = ctx.measureText(lower).width;
            // отрисовка фоновой затирки
            if (!label.transparent) {
              ctx.fillStyle = 'white';
              ctx.fillRect(newX, lowerY - 1, lowerWidth, indexFontSize + 2);
              ctx.fillStyle = fillStyle;
            }
            ctx.fillText(lower, newX, lowerY);
            ctx.font = font;
          }

          newX += Math.max(lowerWidth, upperWidth);
        }
      } else {
        if (!label.transparent) {
          ctx.fillStyle = 'white';
          ctx.fillRect(x, y, width, fontsize + 3);
          ctx.fillStyle = fillStyle;
        }
        ctx.fillText(label.text, x, y + 1.5);
      }

      if (label.selected) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, fontsize + 3);
      }
    };

    const anchor = options.toCanvasPoint(label);
    const angle = -label.angle / 180 * Math.PI;
    let currentYOffset = label.yoffset ?? 0;

    if (options.offsetMap && angle === 0) {
      const offsetMap = options.offsetMap;
      const up = label.yoffset > 0;
      const groupingAlignment = (label.valignment === 1) ? 2 : label.valignment;
      const key = `${label.x},${label.y},${label.halignment},${groupingAlignment},${label.xoffset},${up ? '1' : '0'}`;
      const value = offsetMap.get(key);

      const height = label.fontsize * 25.4 / 72; // pt to mm
      const delta = (height + 1) * (up ? 1 : -1);

      if (value === undefined) {
        offsetMap.set(key, currentYOffset);
      } else {
        currentYOffset = value + delta;
        offsetMap.set(key, currentYOffset);
      }
    }

    const point: Point = {
      x: anchor.x + label.xoffset * 0.001 * dotsPerMeter,
      y: anchor.y - currentYOffset * 0.001 * dotsPerMeter,
    };

    if (angle) {
      ctx.save();
      ctx.translate(point.x, point.y);
      ctx.rotate(angle);
      text(0, 0);
      ctx.restore();
    } else {
      text(point.x, point.y);
    }
    if (label.edited) this.drawPattern(ctx, anchor, point, angle);
  }

  /** Визуализирует смещение, положение и угол в режиме редактирования. */
  private drawPattern(ctx: CanvasRenderingContext2D, anchor: Point, point: Point, angle: number): void {
    const crossRadius = 8;
    const angleRadius = 48;
    const needDrawAngle = Math.abs(angle) > Math.PI / 18;
    const needDrawOffset = Math.abs(anchor.x - point.x) > 4 || Math.abs(anchor.y - point.y) > 4;

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';

    // крестик в месте, где находится якорь подписи
    ctx.beginPath();
    ctx.moveTo(anchor.x - crossRadius, anchor.y);
    ctx.lineTo(anchor.x + crossRadius, anchor.y);
    ctx.moveTo(anchor.x, anchor.y - crossRadius);
    ctx.lineTo(anchor.x, anchor.y + crossRadius);
    ctx.stroke();

    // линия визуализирующая смещение и точка в конце
    if (needDrawOffset) {
      ctx.setLineDash([6, 3]);
      ctx.moveTo(anchor.x, anchor.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // визуализация угла поворота: две прямые и дуга между ними
    if (needDrawAngle) {
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(point.x + angleRadius, point.y);
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(point.x + angleRadius * Math.cos(angle), point.y + angleRadius * Math.sin(angle));
      ctx.moveTo(point.x, point.y);
      ctx.arc(point.x, point.y, angleRadius / 2, 0, angle, angle < 0);
      ctx.stroke();
    }
  }
}
