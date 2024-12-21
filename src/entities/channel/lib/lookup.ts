/** Создаёт ассоциативный массив значений для справочника. */
export function createLookupMap<T = any>(channel: Channel): LookupMap<T> {
  const { config, data } = channel;
  const map: LookupMap<T> = new Map();
  if (!data || data.rows.length === 0) return map;

  const idIndex = config.lookupColumns.id.columnIndex;
  const valueIndex = config.lookupColumns.value.columnIndex;

  for (const row of data.rows) {
    map.set(row[idIndex], row[valueIndex]);
  }
  return map;
}

/** Создаёт список возможных значений и словарь данных канала-справочника. */
export function createLookupList(rows: ChannelRow[], columnsInfo: LookupColumns) {
  const idIndex = columnsInfo.id.columnIndex;
  const valueIndex = columnsInfo.value.columnIndex;
  const dict: LookupDict = {};

  const list = rows.map((row: ChannelRow): LookupListItem => {
    const id = row[idIndex], value = row[valueIndex] ?? '';
    dict[id] = value;
    return {id, value};
  });
  return [list, dict] as [LookupList, LookupDict];
}

/** Создаёт дерево возможных значений и словарь данных канала-справочника. */
export function createLookupTree(rows: ChannelRow[], columnsInfo: LookupColumns) {
  const idIndex = columnsInfo.id.columnIndex;
  const valueIndex = columnsInfo.value.columnIndex;
  const parentIndex = columnsInfo.parent.columnIndex;

  const lookupDict: LookupDict = {};
  const nodeDict: Record<LookupItemID, LookupTreeNode> = {};

  const allNodes = rows.map((row): LookupTreeNode => {
    const id = row[idIndex];
    const value = row[valueIndex] ?? '';
    const node = {id, value, parent: row[parentIndex]};
    nodeDict[id] = node;
    lookupDict[id] = value;
    return node;
  });

  const topNodes: LookupTreeNode[] = [];
  for (const node of allNodes) {
    let parentNode: LookupTreeNode;
    if (node.parent !== null) parentNode = nodeDict[node.parent];

    if (parentNode === undefined) {
      topNodes.push(node);
    } else {
      if (!parentNode.children) parentNode.children = [];
      parentNode.children.push(node);
    }
  }
  return [topNodes, lookupDict] as [LookupTree, LookupDict];
}
