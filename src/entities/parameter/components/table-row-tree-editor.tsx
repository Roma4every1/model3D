import type { EditorProps } from './editor-dict';
import { useEffect, useMemo, useState } from 'react';
import { TreeSelect } from 'antd';
import { onSelectKeyDown } from '../lib/utils';
import { rowToParameterValue } from '../impl/table-row';


interface TreeNode {
  /** Значение селекта, для оптимизации используется индекс в массиве. */
  value: number;
  /** Подпись, которая показывается в выпадающем списке. */
  title: string;
  /** Подпись в нижнем регистре, использующася для поиска. */
  titleLower: string;
  /** Дочерние узлы. */
  children?: TreeNode[];
  /** Значение из колонки с ID. */
  id: any;
  /** Значение из колонки с ID родителя. */
  parent: any;
  /** Исходная запись из канала. */
  row: ChannelRow;
}


export const TableRowTreeEditor = ({parameter, update, channel}: EditorProps<'tableRow'>) => {
  const parameterValue = parameter.getValue();
  const { nullDisplayValue, disabled, loading } = parameter.editor;

  const nullValue = parameter.editor.showNullValue ? -1 : undefined;
  const [value, setValue] = useState(nullValue);

  const rows = channel?.data?.rows;
  const lookupColumns = channel?.config.lookupColumns;

  const [treeData, allNodes] = useMemo(() => {
    return getTreeData(parameter, rows, lookupColumns);
  }, [parameter, rows, lookupColumns]);

  useEffect(() => {
    if (parameterValue) {
      const valueID = parameterValue['LOOKUPCODE']?.value;
      const valueNode = allNodes.find(node => node.id === valueID);
      setValue(valueNode ? valueNode.value : nullValue);
    } else {
      setValue(nullValue);
    }
  }, [parameterValue, allNodes, nullValue]);

  const onSelect = (newValue: number, {row}: TreeNode) => {
    if (newValue === value) return;
    setValue(newValue);
    update(row ? rowToParameterValue(row, channel) : null);
  };
  const onClear = () => {
    setValue(nullValue); update(null);
  };

  return (
    <TreeSelect
      value={value} treeData={treeData} filterTreeNode={filterTreeNode}
      placeholder={nullDisplayValue} allowClear={parameter.nullable} showSearch={true}
      disabled={disabled} loading={loading}
      onClear={onClear} onSelect={onSelect} onKeyDown={onSelectKeyDown}
    />
  );
};

function filterTreeNode(value: string, node: TreeNode): boolean {
  return node.titleLower.startsWith(value.toLowerCase());
}

/** Создаёт дерево возможных значений и словарь данных канала-справочника. */
function getTreeData(parameter: Parameter, rows: ChannelRow[], lookupColumns: LookupColumns): [TreeNode[], TreeNode[]] {
  const nullNode: TreeNode = {
    value: -1, title: parameter.editor.nullDisplayValue, titleLower: '',
    row: null, id: null, parent: null,
  };
  if (!rows || !rows.length || !lookupColumns) {
    return [parameter.editor.showNullValue ? [nullNode] : [], []];
  }

  const idIndex = lookupColumns.id.columnIndex;
  const valueIndex = lookupColumns.value.columnIndex;
  const parentIndex = lookupColumns.parent.columnIndex;

  const nodeDict: Record<LookupItemID, TreeNode> = {};
  const allNodes = rows.map((row, i: number): TreeNode => {
    const idCell = row[idIndex];
    const valueCell = row[valueIndex];
    const parentCell = row[parentIndex];
    const title = valueCell !== null ? String(valueCell) : String(idCell);

    const node: TreeNode = {
      value: i, title, titleLower: title.toLowerCase(),
      children: [], id: idCell, parent: parentCell, row,
    };
    nodeDict[idCell] = node;
    return node;
  });

  const treeData: TreeNode[] = [];
  for (const node of allNodes) {
    let parentNode: TreeNode;
    if (node.parent !== null) parentNode = nodeDict[node.parent];

    if (parentNode === undefined) {
      treeData.push(node);
    } else {
      parentNode.children.push(node);
    }
  }
  if (parameter.editor.showNullValue) treeData.push(nullNode);
  return [treeData, allNodes];
}
