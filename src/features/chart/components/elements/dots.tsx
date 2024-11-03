import type { ChartDotProps, ChartDotOptions, ChartDotRenderer } from '../../lib/chart.types';


export function createDotRenderer(options: ChartDotOptions): ChartDotRenderer {
  switch (options.shape) {
    case 1: return squareRenderer(options);
    case 2: return upsideTriangleRenderer(options);
    case 3: return triangleRenderer(options);
    case 4: return crossRenderer(options);
  }
  return dotRenderer(options);
}

function dotRenderer(options: ChartDotOptions): ChartDotRenderer {
  const size = options.size;
  const r = size / 2;

  return ({cx, cy, fill}: ChartDotProps) => (
    <circle cx={cx} cy={cy} fill={fill} r={r}/>
  );
}

function squareRenderer(options: ChartDotOptions): ChartDotRenderer {
  const size = options.size;
  const offset = size / 2;

  return ({cx, cy, fill}: ChartDotProps) => (
    <rect x={cx - offset} y={cy - offset} width={size} height={size} fill={fill}/>
  );
}

/** Равносторонний треугольник с центром в `(cx,cy)`. */
function triangleRenderer(options: ChartDotOptions): ChartDotRenderer {
  const height = options.size;
  const xOffset = height / Math.sqrt(3); // половина стороны

  return ({cx, cy, fill}: ChartDotProps) => {
    const top = (cy - (2 / 3) * height).toString();
    const bottom = (cy + (1 / 3) * height).toString();
    const points = `${cx},${top} ${cx + xOffset},${bottom} ${cx - xOffset},${bottom}`;
    return <polygon points={points} fill={fill}/>;
  };
}

/** Перевёрнутый равносторонний треугольник с центром в `(cx,cy)`. */
function upsideTriangleRenderer(options: ChartDotOptions): ChartDotRenderer {
  const height = options.size;
  const xOffset = height / Math.sqrt(3); // половина стороны

  return ({cx, cy, fill}: ChartDotProps) => {
    const top = (cy - (2 / 3) * height).toString();
    const bottom = (cy + (1 / 3) * height).toString();
    const points = `${cx},${bottom} ${cx + xOffset},${top} ${cx - xOffset},${top}`;
    return <polygon points={points} fill={fill}/>;
  };
}

function crossRenderer(options: ChartDotOptions): ChartDotRenderer {
  const size = options.size;
  const offset = size / 2;
  const thickness = size / 4;

  return ({cx, cy, fill}: ChartDotProps) => {
    const top = (cy - offset).toString();
    const left = (cx - offset).toString();
    const bottom = (cy + offset).toString();
    const right = (cx + offset).toString();

    const path = `M${left},${top}L${right},${bottom}M${left},${bottom}L${right},${top}`;
    return <path d={path} stroke={fill} strokeWidth={thickness}/>;
  };
}
