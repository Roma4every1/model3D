/** Находит все каналы справочники по набору свойств. */
export function createLookupChannels(properties: ChannelProperty[]): ChannelName[] {
  const result = new Set<ChannelName>();
  for (const property of properties) {
    const lookupChannels = property.lookupChannels;
    if (lookupChannels) lookupChannels.forEach((channel) => result.add(channel));
  }
  return [...result];
}

/* --- Adjacency List --- */

/** Находит названия колонок для задания списка значений или списка смежностей дерева. */
export function createLookupColumnNames(properties: ChannelProperty[]): LookupColumns {
  let idColumnName = 'LOOKUPCODE';           // стандартное название свойства с ID
  let valueColumnName = 'LOOKUPVALUE';       // стандартное название свойства со значением
  let parentColumnName = 'LOOKUPPARENTCODE'; // стандартное название свойства с ID родителя

  let codePropertyColumnName, valuePropertyColumnName, parentPropertyColumnName;
  for (const property of properties) {
    const name = property.name;
    if (name === idColumnName) codePropertyColumnName = property;
    else if (name === valueColumnName) valuePropertyColumnName = property;
    else if (name === parentColumnName) parentPropertyColumnName = property;
  }

  if (codePropertyColumnName) {
    idColumnName = codePropertyColumnName.fromColumn.toUpperCase();
  }
  if (valuePropertyColumnName) {
    valueColumnName = valuePropertyColumnName.fromColumn.toUpperCase();
  }
  if (parentPropertyColumnName) {
    parentColumnName = parentPropertyColumnName.fromColumn.toUpperCase();
  }

  return {
    id: {name: idColumnName, index: -1},
    value: {name: valueColumnName, index: -1},
    parent: {name: parentColumnName, index: -1},
  };
}

/* --- Lookup Data --- */

/** Создаёт список возможных значений и словарь данных канала-справочника. */
export function createLookupList(rows: ChannelRow[], columnsInfo: LookupColumns) {
  const idIndex = columnsInfo.id.index;
  const valueIndex = columnsInfo.value.index;
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
  const idIndex = columnsInfo.id.index;
  const valueIndex = columnsInfo.value.index;
  const parentIndex = columnsInfo.parent.index;

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
