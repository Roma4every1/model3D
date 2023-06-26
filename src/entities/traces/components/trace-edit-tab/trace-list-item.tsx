interface TraceListItemProps {
  pointUWID: number | null,
  points: TracePoint[],
  selectedTraceItemUWID: number | null,
  setSelectedTraceItemUWID,
  removePoint: (pointUWID: number) => void,
}


/** Компонент для списка скважин трассы */
export const TraceListItem = ({pointUWID, points, selectedTraceItemUWID, setSelectedTraceItemUWID, removePoint}: TraceListItemProps) => {
  if (!pointUWID || !points) return <></>;
  const point = points.find(p => p.UWID === pointUWID);

  const className = selectedTraceItemUWID === point?.UWID
    ? 'k-button trace-item selected'
    : 'k-button trace-item';
  const onClick = () => { setSelectedTraceItemUWID(point?.UWID); };

  return (
    <button className={className} disabled={false} onClick={onClick}>
      <span>{point?.name || pointUWID}</span>
      <span className='k-clear-value'>
        <span className={'k-icon k-i-x'} onClick={() => removePoint(point?.UWID)}/>
      </span>
    </button>
  );
};
