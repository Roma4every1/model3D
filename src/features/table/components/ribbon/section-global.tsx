import type { TFunction } from 'react-i18next';
import type { TableState } from '../../lib/types';
import type { ColumnTreeNode, ColumnTreeKey } from '../../lib/table-column-tree';
import { useRender } from 'shared/react';
import { setTableVisibleColumns, updateTableState } from '../../store/table.actions';
import { Popover, Tree } from 'antd';
import { FunctionOutlined } from '@ant-design/icons';
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
        content={<ColumnVisibilityTree state={state} t={t}/>} trigger={'click'}
        placement={'bottom'} arrow={false} overlayClassName={'column-visibility-popover'}
      >
        <BigButton text={t('table.panel.visibility')} icon={visibilityIcon} style={style}/>
      </Popover>
    </MenuSection>
  );
};

const ColumnVisibilityTree = ({state, t}: TableGlobalSectionProps) => {
  const render = useRender();
  const { tree, dict } = state.columns;
  const { topNodes, checkedKeys, expandedKeys } = tree;

  const onCheck = (keys: ColumnTreeKey[], e: {node: ColumnTreeNode}) => {
    const column = dict[e.node.key];
    if (column?.visibilityTemplate) {
      column.visibilityTemplate = undefined;
      state.columns.updateTemplateParameterIDs();
    }
    tree.checkedKeys = keys;
    setTableVisibleColumns(state.id, keys.filter(k => typeof k === 'string'));
  };
  const onExpand = (keys: ColumnTreeKey[]) => {
    tree.expandedKeys = keys;
    render();
  };
  const titleRender = ({key, title}: ColumnTreeNode) => {
    if (!dict[key]?.visibilityTemplate) return title;
    const hint = t('table.panel.auto-visible');
    const style = {backgroundColor: '#eee', borderRadius: 2};
    return <><FunctionOutlined title={hint} style={style}/> {title}</>;
  };

  return (
    <Tree
      treeData={topNodes} checkable={true} selectable={false} titleRender={titleRender}
      checkedKeys={checkedKeys} onCheck={onCheck}
      expandedKeys={expandedKeys} onExpand={onExpand} autoExpandParent={false}
    />
  );
};
