import { once } from 'lodash';
import { useRef, useLayoutEffect } from 'react';
import { pixelPerMeter } from '../../../lib/constants';
import { polylineDrawer } from '../../../lib/selecting-utils';


interface StyleTemplateProps {
  style: PolylineBorderStyle,
  borderColor: string,
  borderWidth: number,
  borderStyle: any,
}

const defaultLineWidth = 25.4 / 96.0;
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
    const ctx = viewRef.current.getContext('2d');
    ctx.clearRect(0, 0, 120, 14);

    if (style) {
      const { baseColor, baseThickness } = style;
      const lineWidth = baseThickness ? baseThickness * defaultLineWidth : (borderWidth || defaultLineWidth);
      ctx.strokeStyle = baseColor || borderColor;
      ctx.lineWidth = lineWidth * 0.001 * window.devicePixelRatio * pixelPerMeter;

      if (style.strokeDashArray) {
        const dashObj = style.strokeDashArray;
        if (dashObj.onBase) {
          const dashes = dashObj.data.split(' ').map(Number);
          for (let j = dashes.length - 1; j >= 0; j--) {
            dashes[j] = dashes[j] * window.devicePixelRatio;
          }
          if (ctx.setLineDash) ctx.setLineDash(dashes);
          if (dashObj.color) ctx.strokeStyle = dashObj.color;
        }
      }

      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(120, 5);
      ctx.stroke();

      const options: MapDrawOptions = {
        ctx: ctx, scale: 1,
        dotsPerMeter: window.devicePixelRatio * pixelPerMeter,
        toMapPoint: (p) => p,
        toCanvasPoint: (p) => p,
      };
      const i: any = {
        arcs: [{path: [0, 5, 120, 5], closed: false}],
        borderwidth: borderWidth, style,
      };
      const decorationPathNeeded = once(() => polylineDrawer.decorationPath(i, options, style));
      decorationPathNeeded();
      ctx.stroke();
      if (ctx.setLineDash) ctx.setLineDash([]);
    }
    else if (borderStyle || borderStyle === 0) {
      if (borderStyles[borderStyle] === 'Clear') return;

      const baseThicknessCoefficient = Math.round((borderWidth || defaultLineWidth) / defaultLineWidth);
      const dash = styleShapes[borderStyles[borderStyle]].slice();
      for (let j = dash.length - 1; j >= 0; j--) {
        dash[j] = dash[j] * window.devicePixelRatio * baseThicknessCoefficient;
      }
      if (ctx.setLineDash) ctx.setLineDash(dash);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = window.devicePixelRatio * (borderWidth || defaultLineWidth) * 0.001 * pixelPerMeter;
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(120, 5);
      ctx.stroke();
      if (ctx.setLineDash) ctx.setLineDash([]);
    }
  });

  const viewRef = useRef<HTMLCanvasElement>(null);
  return <canvas key={borderStyle ?? style} ref={viewRef} width={60} height={10}/>;
}
