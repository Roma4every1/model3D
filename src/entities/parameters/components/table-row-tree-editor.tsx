import { EditorProps } from './editor-dict';
import { useEffect, useMemo, useState } from 'react';
import { TreeSelect } from 'antd';
import { tableRowToString, stringToTableCell } from '../lib/table-row';


interface TreeNode {
  /** Значение селекта, для оптимизации используется индекс в массиве. */
  value: number;
  /** Подпись, которая показывается в выпадающем списке. */
  title: string;
  /** Подпись в нижнем регистре, использующася для поиска. */
  titleLower: string;
  /** Дочерние узлы. */
  children?: TreeNode[];
  /** Значение из колонки с кодом, приведённое к строке. */
  id: string;
  /** Значение из колонки с родителем, приведённое к строке. */
  parent: string | null;
  /** Исходная запись из канала. */
  row: ChannelRow;
}
type TreeData = TreeNode[];


export const TableRowTreeEditor = ({parameter, update, channel}: EditorProps<ParamTableRow>) => {
  const parameterValue = parameter.value;
  const nullValue = parameter.showNullValue ? -1 : undefined;
  const [value, setValue] = useState(nullValue);

  const rows = channel?.data?.rows;
  const lookupColumns = channel ? channel.info.lookupColumns : null;

  const [treeData, allNodes] = useMemo(() => {
    return getTreeData(parameter, rows, lookupColumns);
  }, [parameter, rows, lookupColumns]);

  useEffect(() => {
    if (parameterValue) {
      const valueID = stringToTableCell(parameterValue, 'LOOKUPCODE');
      const valueNode = allNodes.find(node => node.id === valueID);
      setValue(valueNode ? valueNode.value : nullValue);
    } else {
      setValue(nullValue);
    }
  }, [parameterValue, allNodes, nullValue]);

  const onSelect = (newValue: number, {row}: TreeNode) => {
    if (newValue === value) return;
    setValue(newValue);
    update(row ? tableRowToString(channel, row) : null);
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
function getTreeData(parameter: Parameter, rows: ChannelRow[], lookupColumns: LookupColumns): [TreeNode[], TreeNode[]] {
  const nullNode: TreeNode = {
    value: -1, title: parameter.nullDisplayValue, titleLower: '',
    row: null, id: null, parent: null,
  };
  if (!rows || !rows.length || !lookupColumns) {
    return [parameter.showNullValue ? [nullNode] : [], []];
  }

  const idIndex = lookupColumns.id.index;
  const valueIndex = lookupColumns.value.index;
  const parentIndex = lookupColumns.parent.index;

  const nodeDict: Record<LookupItemID, TreeNode> = {};
  const allNodes = rows.map((row, i: number): TreeNode => {
    const idCell = row[idIndex];
    const valueCell = row[valueIndex];
    const parentCell = row[parentIndex];

    const id = idCell !== null ? idCell.toString() : '';
    const title = valueCell !== null ? valueCell.toString() : id;
    const parent = parentCell !== null ? parentCell.toString() : null;

    const node: TreeNode = {
      value: i, title, titleLower: title.toLowerCase(),
      children: [], id, parent, row,
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
  return [treeData, allNodes];
}
