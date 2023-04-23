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
    const upper = property.name.toUpperCase();
    if (upper === idColumnName) codePropertyColumnName = property;
    else if (upper === valueColumnName) valuePropertyColumnName = property;
    else if (upper === parentColumnName) parentPropertyColumnName = property;
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

/** Находит индексы колонок для списка смежностей дерева. */
export function findLookupColumnIndexes(columns: ChannelColumn[], editorColumns: LookupColumns) {
  const codeName = editorColumns.id.name;
  const valueName = editorColumns.value.name;
  const parentName = editorColumns.parent.name;

  columns.forEach((column, i) => {
    const name = column.Name;
    if (name === codeName) return editorColumns.id.index = i;
    if (name === valueName) return editorColumns.value.index = i;
    if (name === parentName) return editorColumns.parent.index = i;
  });
}

/* --- Lookup Data --- */

/** Создаёт список возможных значений и словарь данных канала-справочника. */
export function createLookupList(rows: ChannelRow[], columnsInfo: LookupColumns) {
  const idIndex = columnsInfo.id.index;
  const valueIndex = columnsInfo.value.index;
  const dict: LookupDict = {};

  const list = rows.map((row: ChannelRow): LookupListItem => {
    const cells = row.Cells;
    const id = cells[idIndex], value = cells[valueIndex];
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
  const dict: LookupDict = {};

  const allNodes: LookupTreeNode[] = rows.map((row) => {
    const cells = row.Cells;
    const id = cells[idIndex], value = cells[valueIndex];
    dict[id] = value;
    return {id, value, parent: cells[parentIndex]};
  });
  const topLevelNodes: LookupTree = allNodes.filter(node => node.parent === null);

  const findChildren = (localNodes: LookupTreeNode[]) => {
    for (const node of localNodes) {
      const id = node.id;
      const children = allNodes.filter(n => n.parent === id);
      if (children.length === 0) continue;

      node.children = children;
      findChildren(children);
    }
  };
  findChildren(topLevelNodes);
  return [topLevelNodes, dict] as [LookupTree, LookupDict];
}
