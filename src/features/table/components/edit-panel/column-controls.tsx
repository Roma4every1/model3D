import { TFunction } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { MenuSection, BigButton, ButtonStock } from 'shared/ui';
import { getColumnWidth } from '../../lib/common';
import { findGroupItems, moveColumn } from '../../lib/column-tree-actions';
import { setTableColumns, setTableColumnTree } from '../../store/tables.actions';
import autoWidthIcon from 'assets/images/dataset/auto-width.png';


interface ColumnControlsProps {
  id: FormID,
  state: TableState,
  t: TFunction,
}
interface ColumnOrderControlsProps {
  disabled: Record<string, boolean>,
  move: (to: string) => void,
  lock: () => void,
  t: TFunction,
}


export const ColumnControls = ({id, state, t}: ColumnControlsProps) => {
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
    <MenuSection header={t('table.panel.column.header')} className={'map-actions'}>
      <BigButton
        text={t('table.panel.column.auto-width')} icon={autoWidthIcon}
        action={setAutoWidth} disabled={!activeColumnID}
      />
      <ColumnOrderControls
        move={move} lock={lock} t={t}
        disabled={getMoveButtonsDisabled(settings, activeColumn, groupIndex, groupItems.length)}
      />
    </MenuSection>
  );
};

const ColumnOrderControls = ({move, lock, disabled, t}: ColumnOrderControlsProps) => {
  return (
    <div className={'column-controls'}>
      <span>{t('table.panel.column.order')}</span>
      <ButtonStock
        text={t('table.panel.column.lock')} icon={'pin'}
        action={lock} disabled={lock === undefined}
      />
      <ButtonStock
        text={t('table.panel.column.move-left')} icon={'arrow-60-left'}
        action={() => move('left')} disabled={disabled.left}
      />
      <ButtonStock
        text={t('table.panel.column.move-right')} icon={'arrow-60-right'}
        action={() => move('right')} disabled={disabled.right}
      />
      <ButtonStock
        text={t('table.panel.column.move-start')} icon={'arrow-double-60-left'}
        action={() => move('start')} disabled={disabled.start}
      />
      <ButtonStock
        text={t('table.panel.column.move-end')} icon={'arrow-double-60-right'}
        action={() => move('end')} disabled={disabled.end}
      />
    </div>
  );
};

function getMoveButtonsDisabled(
  settings: TableColumnsSettings, column: TableColumnState,
  index: number, total: number,
) {
  const leftDisabled = !column || index === 0;
  const locked = column?.locked === true;
  const isLastColumn = index === total - 1;
  const isLastLockedColumn = locked && index === settings.lockedCount - 1

  return {
    left: leftDisabled,
    right: isLastColumn || isLastLockedColumn,
    start: leftDisabled,
    end: isLastColumn || locked,
  };
}
