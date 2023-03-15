import { TFunction } from 'react-i18next';
import { EditPanelItemProps } from '../../lib/types';
import { useMemo } from 'react';
import { MenuSection, BigButton, ButtonStock } from 'shared/ui';
import { getColumnWidth } from '../../lib/common';
import { findGroupItems, moveColumn } from '../../lib/column-tree-actions';
import { setTableColumns, setTableColumnTree } from '../../store/tables.actions';
import autoWidthIcon from 'assets/images/dataset/auto-width.png';


interface ColumnOrderControlsProps {
  disabled: Record<string, boolean>,
  move: (to: string) => void,
  lock: () => void,
  t: TFunction,
}

/** Состояние контролов колонки. */
interface ControlsData {
  /** Группа в дереве колонок с активной колонкой. */
  groupItems: ColumnTreeItem[],
  /** Индекс колонки в группе. */
  groupIndex: number,
  /** Активность кнопок изменения порядка колонки. */
  disabled: {left: boolean, right: boolean, start: boolean, end: boolean},
}


export const ColumnControls = ({id, state, dispatch, t}: EditPanelItemProps) => {
  const settings = state.columnsSettings;
  const activeColumnID = state.activeCell.columnID;
  const activeColumn = state.columns[activeColumnID];

  const { groupItems, groupIndex, disabled } = useMemo(() => {
    return getControlsData(state.columnTree, activeColumn, settings.lockedCount);
  }, [state.columnTree, activeColumn, settings.lockedCount]);

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
        disabled={disabled}
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

function getControlsData(tree: ColumnTree, column: TableColumnState, lockedCount: number): ControlsData {
  if (!column) return {
    groupItems: [], groupIndex: -1,
    disabled: {left: true, right: true, start: true, end: true}
  };
  const [groupItems, groupIndex] = findGroupItems(tree, column.field);
  const visibleItems = groupItems.filter(item => item.visible);
  const visibleIndex = visibleItems.findIndex(item => item.field === column.field);
  const disabled = getMoveButtonsDisabled(column, lockedCount, visibleIndex, visibleItems.length);
  return {groupItems, groupIndex, disabled};
}

function getMoveButtonsDisabled(
  column: TableColumnState,
  lockedCount: number, index: number, total: number,
) {
  const leftDisabled = index === 0;
  const locked = column.locked === true;
  const isLastColumn = index === total - 1;
  const isLastLockedColumn = locked && index === lockedCount - 1

  return {
    left: leftDisabled, right: isLastColumn || isLastLockedColumn,
    start: leftDisabled, end: isLastColumn || locked,
  };
}
