import { useDispatch } from 'react-redux';
import { MenuSection, BigButton, ButtonStock } from 'shared/ui';
import { getColumnWidth } from '../../lib/common';
import { findGroupItems, moveColumn } from '../../lib/column-tree-actions';
import { setTableColumns, setTableColumnTree } from '../../store/tables.actions';
import autoWidthIcon from 'assets/images/dataset/auto-width.png';


interface ColumnControlsProps {
  id: FormID,
  state: TableState,
}
interface ColumnOrderControlsProps {
  disabled: Record<string, boolean>,
  move: (to: string) => void,
  lock: () => void,
}


export const ColumnControls = ({id, state}: ColumnControlsProps) => {
  const dispatch = useDispatch();
  const settings = state.columnsSettings;

  const activeColumnID = state.activeCell.columnID;
  const activeColumn = state.columns[activeColumnID];
  const [groupItems, groupIndex] = findGroupItems(state.columnTree, activeColumnID);

  const canLock =
    settings.canUserLockColumns && settings.isLockingEnabled &&
    activeColumn && !activeColumn.locked;

  const lock = canLock ? () => {
    moveColumn(groupItems, groupIndex, 'start');
    for (let i = 0; i < settings.lockedCount; i++) {
      const idx = groupItems.findIndex(c => c.field === activeColumnID);
      moveColumn(groupItems, idx, 'right');
    }
    settings.lockedCount++;
    activeColumn.locked = true;
    dispatch(setTableColumnTree(id, [...state.columnTree]));
  } : undefined;

  const setAutoWidth = () => {
    if (activeColumn.autoWidth) return;
    activeColumn.autoWidth = true;
    activeColumn.width = getColumnWidth(activeColumn.title);
    dispatch(setTableColumns(id, {...state.columns}));
  };

  const move = (to: string) => {
    moveColumn(groupItems, groupIndex, to);
    dispatch(setTableColumnTree(id, [...state.columnTree]));
  };

  return (
    <MenuSection header={'Колонка'} className={'map-actions'}>
      <BigButton
        text={'Авто ширина'} icon={autoWidthIcon}
        action={setAutoWidth} disabled={!activeColumnID}
      />
      <ColumnOrderControls
        move={move} lock={lock}
        disabled={getMoveButtonsDisabled(settings, activeColumn, groupIndex, groupItems.length)}
      />
    </MenuSection>
  );
};

const ColumnOrderControls = ({move, lock, disabled}: ColumnOrderControlsProps) => {
  return (
    <div className={'column-controls'}>
      <span>Порядок</span>
      <ButtonStock
        text={'Зафиксировать'} icon={'pin'}
        action={lock} disabled={lock === undefined}
      />
      <ButtonStock
        text={'Переместить влево'} icon={'arrow-60-left'}
        action={() => move('left')} disabled={disabled.left}
      />
      <ButtonStock
        text={'Переместить вправо'} icon={'arrow-60-right'}
        action={() => move('right')} disabled={disabled.right}
      />
      <ButtonStock
        text={'Переместить в начало'} icon={'arrow-double-60-left'}
        action={() => move('start')} disabled={disabled.start}
      />
      <ButtonStock
        text={'Переместить в конец'} icon={'arrow-double-60-right'}
        action={() => move('end')} disabled={disabled.end}
      />
    </div>
  );
};

function getMoveButtonsDisabled(
  settings: TableColumnsSettings, column: TableColumnState,
  index: number, total: number,
) {
  const locked = column?.locked === true;
  const isFirstColumn = index === 0;
  const isLastColumn = index === total - 1;
  const isLastLockedColumn = locked && index === settings.lockedCount - 1

  return {
    left: isFirstColumn,
    right: isLastColumn || isLastLockedColumn,
    start: isFirstColumn,
    end: isLastColumn || locked,
  };
}
