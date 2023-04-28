/** Преобразование из объекта типа TraceRow в строку канала с трассами. */
export const traceModelToChannelRow = (currentTraceData: TraceModel): ChannelRow => {
  if (!currentTraceData) return null;

  return {ID: null,
    Cells: [
      currentTraceData.id || null,
      currentTraceData.name || "Без названия",
      currentTraceData.stratumID || null,
      currentTraceData.items ? currentTraceData.items.join('---') : null
    ]
  };
}
