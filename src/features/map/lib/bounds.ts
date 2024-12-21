export function getTotalBounds(items: {bounds: Bounds}[]): Bounds {
  let xMin = Infinity, yMin = Infinity;
  let xMax = -Infinity, yMax = -Infinity;

  for (const { bounds } of items) {
    const { x: exMin, y: eyMin } = bounds.min;
    if (exMin < xMin) xMin = exMin;
    if (eyMin < yMin) yMin = eyMin;

    const { x: exMax, y: eyMax } = bounds.max;
    if (exMax > xMax) xMax = exMax;
    if (eyMax > yMax) yMax = eyMax;
  }
  return {min: {x: xMin, y: yMin}, max: {x: xMax, y: yMax}};
}

export function getPointBounds(points: Point[]): Bounds {
  let xMin = Infinity, yMin = Infinity;
  let xMax = -Infinity, yMax = -Infinity;

  for (const { x, y } of points) {
    if (x < xMin) xMin = x;
    if (x > xMax) xMax = x;
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
  }
  return {min: {x: xMin, y: yMin}, max: {x: xMax, y: yMax}};
}

export function getMapElementBounds(element: MapElement): Bounds {
  switch (element.type) {
    case 'polyline': return getPolylineBounds(element);
    case 'label': return getLabelBounds(element);
    case 'sign': return getSignBounds(element);
    case 'pieslice': return getPieSliceBounds(element);
    case 'field': return getFieldBounds(element);
  }
}

export function getPolylineBounds(line: MapPolyline): Bounds {
  let xMin = Infinity, yMin = Infinity;
  let xMax = -Infinity, yMax = -Infinity;

  for (const { path } of line.arcs) {
    for (let i = 0; i < path.length; i += 2) {
      const x = path[i];
      if (x > xMax) xMax = x;
      if (x < xMin) xMin = x;

      const y = path[i + 1];
      if (y > yMax) yMax = y;
      if (y < yMin) yMin = y;
    }
  }
  if (Number.isFinite(xMin) && Number.isFinite(yMin)) {
    return {min: {x: xMin, y: yMin}, max: {x: xMax, y: yMax}};
  }
  return null;
}

export function getLabelBounds(label: MapLabel): Bounds {
  const { x, y } = label;
  return {min: {x, y}, max: {x, y}};
}

export function getSignBounds(sign: MapSign): Bounds {
  const { x, y } = sign;
  return {min: {x, y}, max: {x, y}};
}

export function getPieSliceBounds(pie: MapPieSlice): Bounds {
  const { x, y } = pie;
  return {min: {x, y}, max: {x, y}};
}

export function getFieldBounds(field: MapField): Bounds {
  return {
    min: {x: field.x, y: field.y - field.sizey * field.stepy},
    max: {x: field.x + field.sizex * field.stepx, y: field.y},
  };
}
