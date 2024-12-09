/** Добавление/удаление точек к текущей трассе через клик по карте. */
export function handleTraceClick(model: TraceModel, mapPoint: MapPoint): void {
  const nodes = model.nodes;
  const nodeID = mapPoint.UWID;

  if (nodes.some(node => node.id === nodeID)) {
    model.nodes = nodes.filter(node => node.id !== nodeID);
  } else {
    const newNode: TraceNode = {
      id: nodeID, name: mapPoint.name,
      x: mapPoint.x, y: mapPoint.y,
    };
    model.nodes = [...nodes, newNode];
  }
}
