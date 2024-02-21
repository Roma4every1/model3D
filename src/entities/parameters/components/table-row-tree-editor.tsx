import { EditorProps } from './editor-dict';
import { useEffect, useMemo, useState } from 'react';
import { TreeSelect } from 'antd';
import { tableRowToString, stringToTableCell } from '../lib/table-row';


interface TreeNode {
  /** Значение селекта, используется значение из колонки `LOOKUPCODE`. */
  value: string;
  /** Подпись, которая показывается в выпадающем списке. */
  title: string;
  /** Подпись в нижнем регистре, использующася для поиска. */
  titleLower: string;
  /** Дочерние узлы. */
  children?: TreeNode[];
  /** Исходная запись из канала. */
  row: ChannelRow;
  /** ID родителя. */
  parent: number | string;
}
type TreeData = TreeNode[];


export const TableRowTreeEditor = ({parameter, update, channel}: EditorProps<ParamTableRow>) => {
  const parameterValue = parameter.value;
  const nullValue = parameter.showNullValue ? '' : undefined;
  const [value, setValue] = useState(nullValue);

  const rows = channel?.data?.rows;
  const lookupColumns = channel ? channel.info.lookupColumns : null;

  const [treeData, nodeDict] = useMemo(() => {
    return getTreeData(parameter, rows, lookupColumns);
  }, [parameter, rows, lookupColumns]);

  useEffect(() => {
    if (parameterValue) {
      const valueID = stringToTableCell(parameterValue, 'LOOKUPCODE');
      const valueNode = nodeDict[valueID];
      setValue(valueNode ? valueNode.value : nullValue);
    } else {
      setValue(nullValue);
    }
  }, [parameterValue, nodeDict, nullValue]);

  const onSelect = (value: string, {row}: TreeNode) => {
    if (row) {
      update(tableRowToString(channel, row));
    } else {
      update(null);
    }
    setValue(value);
  };
  const onClear = () => {
    setValue(nullValue); update(null);
  };

  return (
    <TreeSelect
      treeData={treeData} value={value} onSelect={onSelect}
      allowClear={parameter.canBeNull} onClear={onClear}
      showSearch={true} filterTreeNode={filterTreeNode}
      placeholder={parameter.nullDisplayValue}
    />
  );
};

function filterTreeNode(value: string, node: TreeNode): boolean {
  return node.titleLower.startsWith(value.toLowerCase());
}

/** Создаёт дерево возможных значений и словарь данных канала-справочника. */
function getTreeData(parameter: Parameter, rows: ChannelRow[], lookupColumns: LookupColumns): [TreeNode[], Record<LookupItemID, TreeNode>] {
  const nullNode: TreeNode = {
    value: '', title: parameter.nullDisplayValue, titleLower: '',
    row: null, parent: null,
  };
  if (!rows || !rows.length || !lookupColumns) {
    return [parameter.showNullValue ? [nullNode] : [], {}];
  }

  const idIndex = lookupColumns.id.index;
  const valueIndex = lookupColumns.value.index;
  const parentIndex = lookupColumns.parent.index;

  const nodeDict: Record<LookupItemID, TreeNode> = {};
  const allNodes = rows.map((row): TreeNode => {
    const id = row.Cells[idIndex]?.toString() ?? '';
    const value = row.Cells[valueIndex] ?? id;
    const parent = row.Cells[parentIndex];

    const node: TreeNode = {
      value: id, title: value, titleLower: value.toLowerCase(),
      children: [], row, parent,
    };
    nodeDict[id] = node;
    return node;
  });

  const treeData: TreeData = [];
  for (const node of allNodes) {
    let parentNode: TreeNode;
    if (node.parent !== null) parentNode = nodeDict[node.parent];

    if (parentNode === undefined) {
      treeData.push(node);
    } else {
      parentNode.children.push(node);
    }
  }
  if (parameter.showNullValue) treeData.push(nullNode);
  return [treeData, nodeDict];
}
