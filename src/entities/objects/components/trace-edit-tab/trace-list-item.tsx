interface TraceListItemProps {
  node: TraceNode,
  activeNode: TraceNode,
  setActiveNode,
  removeNode: (id: WellID) => void,
}


/** Компонент для списка скважин трассы */
export const TraceListItem = ({node, activeNode, setActiveNode, removeNode}: TraceListItemProps) => {
  const className = node === activeNode
    ? 'k-button trace-item selected'
    : 'k-button trace-item';
  const onClick = () => { setActiveNode(node); };

  return (
    <button className={className} disabled={false} onClick={onClick}>
      <span>{node.name || node.id}</span>
      <span className='k-clear-value'>
        <span className={'k-icon k-i-x'} onClick={() => { removeNode(node.id); }}/>
      </span>
    </button>
  );
};
