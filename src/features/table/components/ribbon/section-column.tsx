import type { TFunction } from 'react-i18next';
import type { TableColumnModel, TableState } from '../../lib/types';
import { Button, InputNumber } from 'antd';
import { IconRow, IconRowButton, MenuSection } from 'shared/ui';
import { ColumnStat } from './column-stat';
import { inputIntParser } from 'shared/locales';
import { maxCellWidth, minCellWidth } from '../../lib/constants';
import textWrapIcon from 'assets/table/text-wrap.svg';

import {
  ForwardOutlined, BackwardOutlined, CaretLeftOutlined, CaretRightOutlined,
  LockOutlined, SyncOutlined
} from '@ant-design/icons';

import {
  setTableColumnFixed, setTableColumnWidth,
  moveTableColumn, updateTableState,
} from '../../store/table.actions';


interface TableColumnSectionProps {
  state: TableState;
  t: TFunction;
}
interface ColumnControlsProps {
  state: TableState;
  activeColumn: TableColumnModel | null;
  t: TFunction;
}


export const TableColumnSection = ({state, t}: TableColumnSectionProps) => {
  const activeColumnID = state.data.activeCell.column;
  const activeColumn = activeColumnID ? state.columns.dict[activeColumnID] : null;

  return (
    <MenuSection className={'big-buttons'} header={t('table.panel.section-column')}>
      <ColumnStat state={state} t={t}/>
      <ColumnCommonControls state={state} activeColumn={activeColumn} t={t}/>
      <ColumnOrderControls state={state} activeColumn={activeColumn} t={t}/>
    </MenuSection>
  );
};

const ColumnCommonControls = ({state, activeColumn, t}: ColumnControlsProps) => {
  let noColumn = true;
  let width: number, fixed = false, wrapped = true;

  if (activeColumn) {
    noColumn = false;
    width = activeColumn.width;
    fixed = activeColumn.fixed;
    wrapped = activeColumn.textWrap ?? state.globalSettings.textWrap;
  }
  const onWidthChange = (value: number | null) => {
    if (value === null) return;
    setTableColumnWidth(state.id, activeColumn.id, value);
  };
  const setAutoWidth = () => {
    if (noColumn || activeColumn.autoWidth) return;
    setTableColumnWidth(state.id, activeColumn.id, -1);
  };
  const toggleFixed = () => {
    setTableColumnFixed(state.id, activeColumn.id, !activeColumn.fixed);
  };
  const toggleTextWrap = () => {
    activeColumn.textWrap = !wrapped;
    if (activeColumn.textWrap === state.globalSettings.textWrap) {
      delete activeColumn.cellStyle.textWrap;
    } else {
      activeColumn.cellStyle.textWrap = activeColumn.textWrap ? 'wrap' : 'nowrap';
    }
    updateTableState(state.id);
  };

  return (
    <div className={'column-common-controls'} style={{margin: '0 6px'}}>
      <InputNumber
        value={width} min={minCellWidth} max={maxCellWidth}
        disabled={!activeColumn} onChange={onWidthChange}
        parser={inputIntParser} controls={false} changeOnWheel={true}
        addonAfter={<SyncOutlined
          style={{padding: 5}} title={t('table.panel.auto-width')} onClick={setAutoWidth}
        />}
      />
      <IconRow>
        <IconRowButton
          icon={<LockOutlined/>} title={t('table.panel.fixation')} active={fixed}
          onClick={toggleFixed} disabled={noColumn}
        />
        <IconRowButton
          icon={textWrapIcon} title={t('table.panel.text-wrap')} active={wrapped}
          onClick={toggleTextWrap} disabled={noColumn}
        />
      </IconRow>
    </div>
  );
};

const ColumnOrderControls = ({state, activeColumn, t}: ColumnControlsProps) => {
  const moveLeft = () => moveTableColumn(state.id, activeColumn.id, 'left');
  const moveRight = () => moveTableColumn(state.id, activeColumn.id, 'right');
  const moveStart = () => moveTableColumn(state.id, activeColumn.id, 'start');
  const moveEnd = () => moveTableColumn(state.id, activeColumn.id, 'end');

  const displayIndex = activeColumn?.displayIndex;
  const disableAll = displayIndex === undefined;
  const leftDisabled = disableAll || displayIndex === 0;
  const rightDisabled = disableAll || displayIndex === state.columns.leafs.length - 1;

  return (
    <div className={'column-order-controls'}>
      <Button type={'text'} icon={<CaretLeftOutlined/>} onClick={moveLeft} disabled={leftDisabled}>
        {t('table.panel.move-left')}
      </Button>
      <Button type={'text'} icon={<CaretRightOutlined/>} onClick={moveRight} disabled={rightDisabled}>
        {t('table.panel.move-right')}
      </Button>
      <Button type={'text'} icon={<BackwardOutlined/>} onClick={moveStart} disabled={leftDisabled}>
        {t('table.panel.move-start')}
      </Button>
      <Button type={'text'} icon={<ForwardOutlined/>} onClick={moveEnd} disabled={rightDisabled}>
        {t('table.panel.move-end')}
      </Button>
    </div>
  );
};
