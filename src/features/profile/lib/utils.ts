/** Получает набор точек трассы с заданным шагом по расстоянию вдоль трассы. */
export const getTraceLines = (nodes: TraceNode[], step = 200) => {
  if (!nodes) return null;
  let resultPoints = [];
  let resultDistance = 0;
  let lastLineRemainder = 0;
  for (let i = 1; i < nodes.length; i++) {
    const line = getTraceLinePoints(nodes[i - 1], nodes[i], step, lastLineRemainder)
    resultPoints = [...resultPoints, ...line.points];
    resultDistance += line.distance;
    lastLineRemainder = line.remainder;
  }
  return {
    points: resultPoints,
    distance: resultDistance
  };
}

/** Получает набор точек с шагом вдоль трассы между двумя узлами трассы. */
export const getTraceLinePoints = (node1: TraceNode, node2: TraceNode, step = 200, remainder = 0) => {
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
    points: result,
    remainder: newRemainder,
    distance
  };
}
