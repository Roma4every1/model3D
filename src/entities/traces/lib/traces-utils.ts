/** Преобразование из объекта типа TraceRow в строку канала с трассами. */
export function traceModelToChannelRow(currentTraceData: TraceModel): ChannelRow {
  if (!currentTraceData) return null;

  const cells = [
    currentTraceData.id || null,
    currentTraceData.name || 'Без названия',
    currentTraceData.stratumID || null,
    currentTraceData.items ? currentTraceData.items.join('---') : null,
  ];
  return {ID: null, Cells: cells};
}
