import type { Key } from 'react';
import type { TFunction } from 'react-i18next';
import type { TableState } from '../../lib/types';
import { useRender } from 'shared/react';
import { setTableVisibleColumns, updateTableState } from '../../store/table.actions';
import { Popover, Tree } from 'antd';
import { BigButton, BigButtonToggle, MenuSection } from 'shared/ui';

import textWrapIcon from 'assets/table/text-wrap.svg';
import alternateIcon from 'assets/table/alternate.svg';
import visibilityIcon from 'assets/table/column-visibility.svg';


interface TableGlobalSectionProps {
  state: TableState;
  t: TFunction;
}


export const TableGlobalSection = ({state, t}: TableGlobalSectionProps) => {
  const settings = state.globalSettings;
  const { textWrap, alternate } = settings;

  const toggleTextWrap = () => {
    for (const column of state.columns.list) {
      column.textWrap = undefined;
      delete column.cellStyle.textWrap;
    }
    settings.textWrap = !textWrap;
    updateTableState(state.id);
  };
  const toggleAlternate = () => {
    settings.alternate = !alternate;
    updateTableState(state.id);
  };
  const style = {width: 70};

  return (
    <MenuSection className={'big-buttons'} header={t('table.panel.section-global')}>
      <BigButtonToggle
        text={t('table.panel.text-wrap')} icon={textWrapIcon} style={style}
        active={textWrap} onClick={toggleTextWrap} disabled={!settings.tableMode}
      />
      <BigButtonToggle
        text={t('table.panel.alternate')} icon={alternateIcon} style={style}
        active={alternate} onClick={toggleAlternate}
      />
      <Popover
        content={<ColumnVisibilityTree state={state}/>} trigger={'click'}
        placement={'bottom'} arrow={false} overlayClassName={'column-visibility-popover'}
      >
        <BigButton text={t('table.panel.visibility')} icon={visibilityIcon} style={style}/>
      </Popover>
    </MenuSection>
  );
};

const ColumnVisibilityTree = ({state}: {state: TableState}) => {
  const render = useRender();
  const tree = state.columns.tree;
  const { topNodes, checkedKeys, expandedKeys } = tree;

  const onCheck = (keys: Key[]) => {
    tree.checkedKeys = keys;
    const visibleColumns = keys.filter(k => typeof k === 'string') as string[];
    setTableVisibleColumns(state.id, visibleColumns);
  };
  const onExpand = (keys: Key[]) => {
    tree.expandedKeys = keys;
    render();
  };

  return (
    <Tree
      treeData={topNodes} checkable={true} selectable={false}
      checkedKeys={checkedKeys} onCheck={onCheck}
      expandedKeys={expandedKeys} onExpand={onExpand} autoExpandParent={false}
    />
  );
};
