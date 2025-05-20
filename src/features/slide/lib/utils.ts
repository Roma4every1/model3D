import type { CSSProperties } from 'react';
import type { SlideTree, SlideElement, SlideButtonPayload } from './slide.types';


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

    let payload = row[payloadIndex];
    if (type === 'button' && payload) payload = parseButtonPayload(payload);
    elements.push({id, parent: row[parentIndex], type, title, payload, style});
  }
  return elements;
}

function parseButtonPayload(payload: string): SlideButtonPayload {
  const semicolonIndex = payload.indexOf(';');
  if (semicolonIndex === -1) return {program: payload};

  const programID = payload.substring(0, semicolonIndex);
  const inputs = payload.substring(semicolonIndex + 1);
  if (!inputs) return {program: programID};

  const values: Record<string, string> = {};
  for (const input of inputs.split(',')) {
    const match = input.match(/(\w+)(?:=(.*))?/);
    if (match) values[match[1]] = match[2] || null;
  }
  return {program: programID, values};
}
