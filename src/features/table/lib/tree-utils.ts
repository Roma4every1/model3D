import type { TableColumnModel, TableColumnGroupDict, TableHeadLayout, TableHeadLayoutGroup } from './types';


export function createHeadLayout(leafs: TableColumnModel[], groups: TableColumnGroupDict): TableHeadLayout {
  let depth = 0;
  for (const leaf of leafs) {
    const pathDepth = leaf.property.treePath.length;
    if (pathDepth > depth) depth = pathDepth;
  }
  if (depth === 0) return [leafs];

  const layout: TableHeadLayout = [];
  const matrix: string[][] = [];
  for (let i = 0; i < depth; ++i) matrix.push(new Array(leafs.length).fill(null));

  leafs.forEach((leaf, j) => {
    const path = leaf.property.treePath;
    const delta = depth - path.length;

    for (let i = 0; i < path.length; ++i) {
      matrix[i + delta][j] = path[i];
    }
  });
  for (const row of matrix) {
    const layoutRow: TableHeadLayoutGroup[] = [];
    let idx = 0, colSpan = 0;
    let value = row[idx];

    while (true) {
      const nextValue = row[idx++];
      if (value === nextValue) { ++colSpan; continue; }

      if (value === null) {
        layoutRow.push({colSpan});
      } else {
        const settings = groups[value];
        const displayName = settings?.displayName ?? value;
        layoutRow.push({displayName, colSpan, style: settings?.style});
      }
      if (nextValue === undefined) break;
      colSpan = 1; value = nextValue;
    }
    layout.push(layoutRow);
  }
  layout.push(leafs);
  return layout;
}
