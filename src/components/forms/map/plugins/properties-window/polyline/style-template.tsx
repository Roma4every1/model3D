import { once } from 'lodash';
import { useRef, useLayoutEffect } from 'react';
import { PIXEL_PER_METER } from '../../../map-utils';
import { polylineType } from '../../selecting/selecting-utils';


interface StyleTemplateProps {
  style: PolylineBorderStyle,
  borderColor: string,
  borderWidth: number,
  borderStyle: any,
}


const defaultLineWidth = 25.4 / 96.0;
const thicknessCoefficient = window.devicePixelRatio || 1;
const borderStyles = ['Solid', 'Dash', 'Dot', 'DashDot', 'DashDotDot', 'Clear'];
const styleShapes = {
  Solid: [],
  Dash: [5, 1],
  Dot: [1, 1],
  DashDot: [5, 1, 1, 1],
  DashDotDot: [5, 1, 1, 1, 1, 1],
  Clear: [],
};

export const StyleTemplate = ({style, borderColor, borderWidth, borderStyle}: StyleTemplateProps) => {
  useLayoutEffect(() => {
    let ctx = viewRef.current.getContext('2d');
    ctx.clearRect(0, 0, 150, 14);

    if (style) {
      if (style.baseColor)
        ctx.strokeStyle = style.baseColor._value;
      else
        ctx.strokeStyle = borderColor;
      if (style.baseThickness)
        ctx.lineWidth = thicknessCoefficient * style.baseThickness._value * defaultLineWidth * 0.001 * PIXEL_PER_METER;  // Thickness
      else
        ctx.lineWidth = thicknessCoefficient * (borderWidth || defaultLineWidth) * 0.001 * PIXEL_PER_METER;
      if (style.StrokeDashArrays) {
        const dashObj = style.StrokeDashArrays[0].StrokeDashArray[0];
        if (dashObj.onBase._value) {
          const dashes = dashObj.data._value.split(" ").map(Number);
          for (let j = dashes.length - 1; j >= 0; j--) {
            dashes[j] = dashes[j] * thicknessCoefficient;
          }
          if (ctx.setLineDash) ctx.setLineDash(dashes);
          if (dashObj.color) ctx.strokeStyle = dashObj.color._value;
        }
      }

      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(110, 5);
      ctx.stroke();

      const options = {
        pixelRatio: thicknessCoefficient,
        dotsPerMeter: PIXEL_PER_METER,
        context: ctx,
        pointToControl: (p) => p
      };
      const i: Partial<MapPolyline> = {
        arcs: [{path: [0, 5, 110, 5], closed: false}],
        borderwidth: borderWidth, style
      };
      const decorationPathNeeded = once(() => polylineType.decorationPath(i, options, style));
      decorationPathNeeded();
      ctx.stroke();
      if (ctx.setLineDash) ctx.setLineDash([]);
    }
    else if (borderStyle || borderStyle === 0) {
      if (borderStyles[borderStyle] === 'Clear') return;

      const baseThicknessCoefficient = Math.round((borderWidth || defaultLineWidth) / defaultLineWidth);
      const dash = styleShapes[borderStyles[borderStyle]].slice();
      for (let j = dash.length - 1; j >= 0; j--) {
        dash[j] = dash[j] * thicknessCoefficient * baseThicknessCoefficient;
      }
      if (ctx.setLineDash) ctx.setLineDash(dash);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = thicknessCoefficient * (borderWidth || defaultLineWidth) * 0.001 * PIXEL_PER_METER;
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(110, 5);
      ctx.stroke();
      if (ctx.setLineDash) ctx.setLineDash([]);
    }
  });

  const viewRef = useRef<HTMLCanvasElement>(null);
  return <canvas key={borderStyle ?? style} ref={viewRef} width={140} height={10}/>;
}
