import type { IJsonBorderNode, IJsonRowNode, IJsonTabSetNode, IJsonTabNode } from 'flexlayout-react';
import type { XRawElement } from 'shared/lib';
import type { LeftTabInfo } from 'widgets/left-panel';
import { Model, Actions } from 'flexlayout-react';
import { XElement } from 'shared/lib';
import { MainLayoutController } from './layout-controller';
import { LeftLayoutController } from 'widgets/left-panel';
import { serializeLegacyRow } from 'widgets/presentation';
import { appLayoutAttrs, leftLayoutAttrs, leftTabInfo, topTabDict, rightTabDict } from './layout-constants';


interface MainLayoutOptions {
  /** Ширина левой панели. */
  sizeLeft: number;
  /** Ширина правой панели. */
  sizeRight: number;
  /** Индекс активной вкладки сверху. */
  selectedTop: number;
  /** Индекс активной вкладки справа. */
  selectedRight: number;
}

export function createAppLayout(dto: XRawElement, popup: boolean): AppLayout {
  if (popup) {
    return createPopupLayout();
  } else {
    return createMainLayout(dto);
  }
}

/* --- Popup Layout --- */

function createPopupLayout(): AppLayout {
  const leftBorder: IJsonTabNode = {
    type: 'tab', enableDrag: false,
    id: 'left-border', name: 'Параметры презентации',
  };
  const border: IJsonBorderNode = {
    type: 'border', location: 'left',
    size: 200, minSize: 150,
    children: [leftBorder], selected: -1,
  };
  const content: IJsonTabSetNode = {
    type: 'tabset', minWidth: 200,
    children: [{type: 'tab', component: 'form'}],
  };
  const model = Model.fromJson({
    global: appLayoutAttrs, borders: [border],
    layout: {type: 'row', children: [content]},
  });
  const mainLayout = new MainLayoutController(model, -1, -1);
  return {main: mainLayout, left: null, source: null};
}

/* --- Main --- */

function createMainLayout(dto: XRawElement): AppLayout {
  const root = XElement.tryCreate(dto);
  const splitContainers = root?.getChildThrough('RadDocking', 'SplitContainers');

  const containers = splitContainers?.getChildren('RadSplitContainer');
  const leftContainer = containers?.find(c => c.getAttribute('Dock') === 'DockedLeft');
  const rightContainer = containers?.find(c => c.getAttribute('Dock') === 'DockedRight');

  const options: MainLayoutOptions = {
    sizeLeft: leftContainer?.getNumberAttribute('Width') ?? 250,
    sizeRight: rightContainer?.getNumberAttribute('Width') ?? 250,
    selectedTop: splitContainers?.getIntAttribute('TopSelectedIndex') ?? -1,
    selectedRight: rightContainer?.getIntAttribute('SelectedIndex') ?? -1,
  };
  const model = createMainModel(options);
  const mainLayout = new MainLayoutController(model, options.selectedTop, options.selectedRight);

  const leftLayout = new LeftLayoutFactory().create(leftContainer);
  return {main: mainLayout, left: leftLayout, source: dto};
}

function createMainModel(options: MainLayoutOptions): Model {
  const topBorder: IJsonBorderNode = {
    type: 'border', location: 'top',
    size: 90, minSize: 90,
    children: [topTabDict['menu']],
    selected: options.selectedTop < 1 ? options.selectedTop : -1,
  };
  const rightBorder: IJsonBorderNode = {
    type: 'border', location: 'right',
    size: options.sizeRight, minSize: 150,
    children: [rightTabDict['right-dock']],
    selected: options.selectedRight < 1 ? options.selectedRight : -1,
  };

  const leftPanelContent: IJsonTabSetNode = {
    type: 'tabset', width: options.sizeLeft, minWidth: 150,
    children: [{id: 'left', type: 'tab', component: 'left'}],
  };
  const mainContent: IJsonTabSetNode = {
    type: 'tabset', minWidth: 200,
    children: [{type: 'tab', component: 'form'}],
  };
  return Model.fromJson({
    global: appLayoutAttrs, borders: [topBorder, rightBorder],
    layout: {type: 'row', children: [leftPanelContent, mainContent]},
  });
}

/* --- Left Layout --- */

class LeftLayoutFactory {
  private readonly gp: LeftTabInfo;
  private readonly pp: LeftTabInfo;
  private readonly pt: LeftTabInfo;

  constructor() {
    const { id1: gTabID, name: gName } = leftTabInfo.globalParameters;
    const { id: pTabID, name: pName } = leftTabInfo.presentationParameters;
    const { id: tTabID, name: tName } = leftTabInfo.presentationTree;

    this.gp = {id: gTabID, displayName: gName, show: false};
    this.pp = {id: pTabID, displayName: pName, show: false};
    this.pt = {id: tTabID, displayName: tName, show: false};
  }

  public create(container: XElement): ILeftLayoutController {
    const row = container ? this.createRow(container) : null;
    if (!row) return this.createDefault();
    row.id = 'left-root';

    const rootOrientationVertical = container.getAttribute('Orientation') === 'Vertical';
    const global = {...leftLayoutAttrs, rootOrientationVertical};
    const model = Model.fromJson({global, layout: row});

    const { id1, id2 } = leftTabInfo.globalParameters;
    const gTab1 = model.getNodeById(id1);
    const gTab2 = model.getNodeById(id2);

    if (gTab1 && gTab2) model.doAction(Actions.deleteTab(id1));
    return new LeftLayoutController(model, this.gp, this.pp, this.pt);
  }

  /** Ожидается элемент `<RadSplitContainer/>`. */
  private createRow(element: XElement): IJsonRowNode {
    const toRowChild = (e: XElement): IJsonRowNode | IJsonTabSetNode | null => {
      if (e.getName() === 'RadPaneGroup') {
        return this.createTabSet(e);
      } else if (e.getName() === 'RadSplitContainer') {
        return this.createRow(e);
      }
      return null;
    };
    const itemElement = element.getChild('Items');
    const children = itemElement?.getChildren()?.map(toRowChild).filter(Boolean);
    if (!children || children.length == 0) return null;

    const weight = element.getNumberAttribute('SplitterChange');
    return {type: 'row', weight, children};
  }

  /** Ожидается элемент `<RadPaneGroup/>`. */
  private createTabSet(element: XElement): IJsonTabSetNode | null {
    const children = this.createTabs(element.getChildrenThrough('Items', 'RadPane'));
    if (children.length == 0) return null;

    let selected = element.getIntAttribute('SelectedIndex') ?? 0;
    if (selected < 0 || selected > children.length - 1) return null;

    const weight = element.getNumberAttribute('SplitterChange');
    const maximized = element.getBooleanAttribute('Maximized');
    return {type: 'tabset', weight, selected, maximized, children};
  }

  /** Ожидаются элементы `<RadPane/>`. */
  private createTabs(items: XElement[]): IJsonTabNode[] {
    const tabNodes: IJsonTabNode[] = [];
    const { id1: gID1, id2: gID2, name: gName } = leftTabInfo.globalParameters;
    const { id: pID, name: pName } = leftTabInfo.presentationParameters;
    const { id: tID, name: tName } = leftTabInfo.presentationTree;

    for (const item of items) {
      const id = item.getAttribute('SerializationTag');
      if (!id) continue;
      const tabName = item.getAttribute('Title') ?? item.getAttribute('Header');

      if (id === gID1 || id === gID2) {
        const name = tabName ?? gName;
        tabNodes.push({type: 'tab', id: id, name, component: 'globalParameters'});
        this.gp.id = id;
        this.gp.show = true;
      }
      else if (!this.pp.show && id === pID) {
        const name = tabName ?? pName;
        tabNodes.push({type: 'tab', id: id, name, component: 'presentationParameters'});
        this.pp.id = id;
        this.pp.show = true;
      }
      else if (!this.pt.show && id === tID) {
        const name = tabName ?? tName;
        tabNodes.push({type: 'tab', id: id, name, component: 'presentationTree'});
        this.pt.id = id;
        this.pt.show = true;
      }
    }
    return tabNodes;
  }

  /* --- --- */

  private createDefault(): ILeftLayoutController {
    const gpParentID = 'gp-tabset', ptParentID = 'pt-tabset';
    this.gp.parent = gpParentID; this.gp.index = 0; this.gp.show = true;
    this.pt.parent = ptParentID; this.pt.index = 0; this.pt.show = true;

    const gpTab: IJsonTabNode = {
      id: this.gp.id, type: 'tab',
      name: this.gp.displayName, component: 'globalParameters',
    };
    const ptTab: IJsonTabNode = {
      id: this.pt.id, type: 'tab',
      name: this.pt.displayName, component: 'presentationTree',
    };
    const layout: IJsonRowNode = {id: 'left-root', type: 'row', children: [
      {id: gpParentID, type: 'tabset', children: [gpTab]},
      {id: ptParentID, type: 'tabset', children: [ptTab]},
    ]};

    const model = Model.fromJson({global: leftLayoutAttrs, layout});
    return new LeftLayoutController(model, this.gp, this.pp, this.pt);
  }
}

/* --- Serialization --- */

export function serializeAppLayout(layout: AppLayout): XRawElement {
  let source = layout.source as XRawElement;
  if (!source) source = {name: 'layout', children: []};

  const docking = getOrCreate(source, 'RadDocking');
  const container = getOrCreate(docking, 'SplitContainers');
  if (!Array.isArray(container.children)) container.children = [];

  const containers = container.children.filter(c => c.name === 'RadSplitContainer');
  let leftIndex = containers.findIndex(c => c.attrs?.Dock === 'DockedLeft');
  let rightContainer = containers.find(c => c.attrs?.Dock === 'DockedRight');

  const { model, topBorder, rightBorder } = layout.main as MainLayoutController;
  const left = layout.left.model as Model;
  const leftContainer = serializeLegacyRow(left.getRoot());
  leftContainer.attrs.Dock = 'DockedLeft';

  if (leftIndex === -1) {
    container.children.push(leftContainer);
  } else {
    container.children[leftIndex] = leftContainer;
  }
  if (!rightContainer) {
    rightContainer = {name: 'RadSplitContainer', attrs: {Dock: 'DockedRight'}};
    container.children.push(rightContainer);
  }
  setAttr(container, 'TopSelectedIndex', topBorder.getSelected());
  setAttr(leftContainer, 'Width', model.getNodeById('left').getRect().width);
  setAttr(rightContainer, 'Width', rightBorder.getSize());
  setAttr(rightContainer, 'SelectedIndex', rightBorder.getSelected());
  return source;
}

function getOrCreate(raw: XRawElement, name: string): XRawElement {
  if (Array.isArray(raw.children)) {
    let child = raw.children.find(c => c.name === name);
    if (!child) { child = {name, children: []}; raw.children.push(child); }
    return child;
  } else {
    const child: XRawElement = {name, children: []};
    raw.children = [child];
    return child;
  }
}

function setAttr(raw: XRawElement, name: string, value: string | number | boolean): void {
  if (!raw.attrs) raw.attrs = {};
  raw.attrs[name] = String(value);
}
