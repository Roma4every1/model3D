import type { CSSProperties } from 'react';
import type { SlideTree, SlideElement } from './slide.types';


export function createTree(elements: SlideElement[]): SlideTree {
  const map = new Map<SlideElementID, SlideElement>();
  for (const element of elements) map.set(element.id, element);

  const topNodes: SlideElement[] = [];
  for (const record of elements) {
    const parent = record.parent;
    if (parent === null) { topNodes.push(record); continue; }

    const parentNode = map.get(parent);
    if (!parentNode) continue;

    let children = parentNode.children;
    if (!children) { children = []; parentNode.children = children; }
    children.push(record);
  }
  return topNodes;
}

export function createElements(
  data: ChannelData, info: ChannelRecordInfo<keyof SlideElement>,
  styles: Record<string, CSSProperties>,
): SlideElement[] {
  const elements: SlideElement[] = [];
  if (!data) return elements;

  const findIndex = (name: ColumnName) => data.columns.findIndex(c => c.name === name);
  const idIndex = findIndex(info.id.columnName);
  const parentIndex = findIndex(info.parent.columnName);
  const typeIndex = findIndex(info.type.columnName);
  const titleIndex = findIndex(info.title.columnName);
  const payloadIndex = findIndex(info.payload.columnName);
  const styleIndex = findIndex(info.style.columnName);

  for (const row of data.rows) {
    const id = row[idIndex];
    const type = row[typeIndex];
    if (id === null || type === null) continue;

    const title = row[titleIndex] ?? undefined;
    const style = row[styleIndex] ? styles[row[styleIndex]] : undefined;
    elements.push({id, parent: row[parentIndex], type, title, payload: row[payloadIndex], style});
  }
  return elements;
}
