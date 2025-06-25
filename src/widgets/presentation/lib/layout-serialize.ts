import type { XRawElement, XAttributes } from 'shared/lib';
import { Model, RowNode, TabSetNode, TabNode } from 'flexlayout-react';
import { round } from 'shared/lib';


/** Сериализует разметку презентации в XML. */
export function serializePresentationLayout(model: Model): XRawElement {
  const root = model.getRoot();
  const vertical = model.isRootOrientationVertical();

  if (root.getId() === 'legacy') {
    const row = serializeLegacyRow(root);
    const host: XRawElement = {name: 'DocumentHost', children: [row]};
    return {name: 'layout', children: [{name: 'RadDocking', children: [host]}]};
  } else {
    const element = serializeRow(root);
    if (element.name === 'row') element.attrs.orientation = vertical ? 'vertical' : 'horizontal';
    return {name: 'layout', children: [element]};
  }
}

/* --- New Format --- */

function serializeRow(node: RowNode): XRawElement {
  const weight = serializeWeight(node);
  const children = node.getChildren().map(serializeRowChild);

  if (children.length === 1) {
    children[0].attrs.weight = weight;
    return children[0];
  }
  return {name: 'row', attrs: {weight}, children};
}

function serializeRowChild(node: RowNode | TabSetNode): XRawElement {
  if (node.getType() === 'row') {
    return serializeRow(node as RowNode);
  } else {
    return serializeTabSet(node as TabSetNode);
  }
}

function serializeTabSet(node: TabSetNode): XRawElement {
  const children = node.getChildren().map(serializeTab);
  const attrs: XAttributes = {weight: serializeWeight(node)};

  if (node.getSelected()) attrs.selected = node.getSelected().toString();
  if (node.getMinWidth()) attrs.minWidth = node.getMinWidth().toString();
  if (node.getMinHeight()) attrs.minHeight = node.getMinHeight().toString();
  if (node.isMaximized()) attrs.maximized = 'true';
  if (!node.isEnableTabStrip()) attrs.strip = 'false';

  if (children.length === 1) {
    const child = children[0];
    Object.assign(child.attrs, attrs);
    return child;
  }
  return {name: 'tabs', attrs, children};
}

function serializeTab(node: TabNode): XRawElement {
  if (node.getComponent() === 'layout') return serializeRowTab(node);
  const id = node.getId();
  const name = id.substring(id.lastIndexOf(',') + 1);
  const displayName = node.getName();
  const title = typeof displayName === 'string' ? displayName : undefined;
  return {name: 'client', attrs: {name, title}};
}

function serializeRowTab(node: TabNode): XRawElement {
  const model = node.getConfig() as Model;
  const row = serializeRow(model.getRoot());
  row.attrs.orientation = model.isRootOrientationVertical() ? 'vertical' : 'horizontal';
  row.attrs.title = node.getName();
  return row;
}

function serializeWeight(node: RowNode | TabSetNode): string | undefined {
  const weight = node.getWeight();
  if (weight === 100) return undefined; // default value
  return round(node.getWeight(), 2).toString();
}

/* --- Legacy Format --- */

export function serializeLegacyRow(node: RowNode): XRawElement {
  let orientation = node.getOrientation().getName();
  orientation = orientation.startsWith('v') ? 'Vertical' : 'Horizontal';

  const weight = serializeWeight(node);
  const attrs: XAttributes = {'Orientation': orientation, 'SplitterChange': weight};
  const children = node.getChildren().map(serializeLegacyRowChild);

  if (children.length === 1) {
    const attrs = children[0].attrs;
    if (attrs) delete attrs['SplitterChange'];
  }
  return {name: 'RadSplitContainer', attrs, children: [{name: 'Items', children}]};
}

function serializeLegacyRowChild(node: RowNode | TabSetNode): XRawElement {
  if (node.getType() === 'row') {
    return serializeLegacyRow(node as RowNode);
  } else {
    return serializeLegacyTabSet(node as TabSetNode);
  }
}

function serializeLegacyTabSet(node: TabSetNode): XRawElement {
  const attrs: XAttributes = {'SplitterChange': serializeWeight(node)};
  if (node.getSelected()) attrs['SelectedIndex'] = node.getSelected().toString();
  if (node.isMaximized()) attrs['Maximized'] = 'true';

  const children = node.getChildren().map(serializeLegacyTab);
  return {name: 'RadPaneGroup', attrs, children: [{name: 'Items', children}]};
}

function serializeLegacyTab(node: TabNode): XRawElement {
  const id = node.getId();
  const tag = id.substring(id.lastIndexOf(',') + 1);
  const name = node.getName();
  const title = typeof name === 'string' ? name : undefined;
  return {name: 'RadPane', attrs: {'SerializationTag': tag, 'Title': title}};
}
