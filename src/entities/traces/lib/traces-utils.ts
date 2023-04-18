/** Преобразование строки канала с трассами в объект типа TraceRow. */
export const traceChannelRowToModel= (traceChannelRow: ChannelRow): TraceModel => {
  if (!traceChannelRow) return null;

  return {
      id: traceChannelRow.Cells[0],
      name: traceChannelRow.Cells[1],
      stratumID: traceChannelRow.Cells[2],
      items: traceChannelRow.Cells[3] ? traceChannelRow.Cells[3].split('---') : null
  }
}

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
