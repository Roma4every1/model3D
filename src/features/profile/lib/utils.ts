
/** Получает набор точек трассы с заданным шагом по расстоянию вдоль трассы. */
export const getTraceLines = (nodes: UstPoint[], points: UstPoint[], step = 200): TraceLinesData => {
  if (!nodes) return null;
  let resultPoints = [];
  let resultDistance = 0;
  let lastLineRemainder = 0;
  const lines: TraceLineData[] = [];

  for (let i = 1; i < nodes.length; i++) {
    const line = getTraceLinePoints(nodes[i - 1], nodes[i], step, lastLineRemainder);
    lines.push(line);
    resultPoints = [...resultPoints, ...line.points];
    resultDistance += line.distance;
    lastLineRemainder = line.remainder;
  }

  return {
    points: resultPoints,
    distance: resultDistance,
    additionalWells: getAdditionalProfilePoints(lines, points)
  };
}

/** Получает набор точек с шагом вдоль трассы между двумя узлами трассы. */
export const getTraceLinePoints = (
  node1: UstPoint,
  node2: UstPoint,
  step = 200,
  remainder = 0
): TraceLineData => {

  const result = [];
  const distance = Math.sqrt(Math.pow(node1.x - node2.x, 2) +
    Math.pow(node1.y - node2.y, 2))

  let newRemainder = 0;
  for (let c = step - remainder; c < distance; c += step) {
    newRemainder = distance - c;
    result.push({
      x: node1.x + c / distance * (node2.x - node1.x),
      y: node1.y + c / distance * (node2.y - node1.y),
    })
  }

  return {
    startNode: node1,
    endNode: node2,
    points: result,
    remainder: newRemainder,
    distance
  };
}

/** Получает расстояние между двумя точками. */
export const getPointsDistance2D = (point1: Point, point2: Point) => {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) +
    Math.pow(point1.y - point2.y, 2))
}

export const getPointsDistance3D = (point1: Point, point2: Point, depth1: number, depth2: number) => {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) +
    Math.pow(point1.y - point2.y, 2) + Math.pow(depth1 - depth2, 2));
}

export const getAdditionalProfilePoints = (traceLines: TraceLineData[], points: UstPoint[]) => {
  const additionalPoints: UstPoint[] = [];

  for (const p of points) {
    for (const l of traceLines) {
      const pointToStart = getPointsDistance2D(p, l.startNode);
      const pointToEnd = getPointsDistance2D(p, l.endNode);

      if (pointToStart < l.distance || pointToEnd < l.distance) {
        additionalPoints.push(p);
        break;
      }
    }
  }

  return additionalPoints;
}
