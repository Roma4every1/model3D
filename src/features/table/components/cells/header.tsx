import { GridHeaderCellProps } from '@progress/kendo-react-grid';
import { useDispatch } from 'react-redux';
import { updateSortOrder } from 'entities/channels';


interface HeaderCellThis {
  channelName: ChannelName,
  channelColumn: string,
  query: ChannelQuerySettings,
}


export function HeaderCell(this: HeaderCellThis, {title}: GridHeaderCellProps) {
  const dispatch = useDispatch();

  const { channelName, channelColumn, query } = this;
  const direction = query.order.find(o => o.column === channelColumn)?.direction ?? null;

  const onClick = () => {
    // по возврастанию -> по убыванию -> без порядка
    let newDirection: SortOrderDirection = null;
    if (direction === null) newDirection = 'desc';
    else if (direction === 'desc') newDirection = 'asc';
    const order = newDirection ? [{column: channelColumn, direction: newDirection}] : [];
    dispatch(updateSortOrder(channelName, order));
  };

  return (
    <span className={'header-cell direction-' + direction} onClick={onClick}>
      {title}
    </span>
  );
}

export const GroupHeaderCell = ({title}: GridHeaderCellProps) => {
  return <span>{title}</span>;
};
