interface TraceListItemProps {
  pointUWID: string | null,
  points,
  selectedTraceItemUWID: string | null,
  setSelectedTraceItemUWID,
  removePoint
}

// компонент для списка скважин трассы
export const TraceListItem = ( {pointUWID, points, selectedTraceItemUWID,
                          setSelectedTraceItemUWID, removePoint}: TraceListItemProps) => {
  if (!pointUWID ||
    !points
  ) return <></>;
  const point= points.find(p => p.UWID === pointUWID)
  return (
    <button
      className={selectedTraceItemUWID === point?.UWID ? 'k-button trace-item selected' : 'k-button trace-item'}
      disabled={false} onClick={() => setSelectedTraceItemUWID(point?.UWID)}
    >
      <span>{point?.name || "Без имени"}</span>
      <span className='k-clear-value'>
        <span className={'k-icon k-i-x'} onClick={() => removePoint(point?.UWID)}/>
      </span>
    </button>
  );
}
