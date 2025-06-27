import type { XRawElement } from 'shared/lib';
import type { IGlobalAttributes, IJsonRowNode, IJsonTabSetNode, IJsonTabNode } from 'flexlayout-react';
import { Model } from 'flexlayout-react';
import { XElement } from 'shared/lib';
import { createElement } from 'react';
import { FormHeader } from '../components/form-header';


const globalAttributes: IGlobalAttributes = {
  rootOrientationVertical: false,
  tabEnableRename: false,
  tabEnableClose: false,
  tabEnableDrag: false,
  tabSetEnableDrag: false,
  tabSetTabStripHeight: 26,
  splitterSize: 6,
};

export class PresentationLayoutFactory {
  private readonly id: ClientID;
  private readonly forms: FormDataWM[];
  private readonly activeForm: FormID;

  constructor(id: ClientID, forms: FormDataWM[], active: FormID) {
    this.id = id;
    this.forms = forms;
    this.activeForm = active;
  }

  public create(dto: XRawElement): Model {
    const e = XElement.tryCreate(dto);
    return this.createLayout(e) ?? this.createLegacy(e) ?? this.createDefault();
  }

  /* --- New Format --- */

  public createLayout(element: XElement): Model | null {
    const main = element?.getChild();
    if (!main) return null;

    let rootNode: IJsonRowNode;
    const global: IGlobalAttributes = {...globalAttributes};

    if (main.getName() === 'row') {
      rootNode = this.createRow(main);
      global.rootOrientationVertical = main.getAttribute('orientation') === 'vertical';
    } else {
      const child = this.createRowChild(main);
      if (!child) return null;
      rootNode = {type: 'row', children: [child]};
    }
    return Model.fromJson({global, layout: rootNode});
  }

  /** Ожидается элемент `<row/>`. */
  private createRow(element: XElement): IJsonRowNode | null {
    const children = element.getChildren().map(e => this.createRowChild(e)).filter(Boolean);
    if (children.length === 0) return null;
    const weight = element.getNumberAttribute('weight');
    return {type: 'row', children, weight};
  }

  private createRowChild(element: XElement): IJsonRowNode | IJsonTabSetNode | null {
    const name = element.getName();
    if (name === 'row') return this.createRow(element);
    if (name === 'tabs') return this.createTabSet(element);

    if (name === 'client') {
      const tabNode = this.createTab(element);
      if (!tabNode) return null;

      return {
        type: 'tabset', children: [tabNode], selected: 0,
        weight: element.getNumberAttribute('weight'),
        minWidth: element.getNumberAttribute('minWidth') || undefined,
        minHeight: element.getNumberAttribute('minHeight') || undefined,
        maximized: element.getBooleanAttribute('maximized') ?? false,
        active: tabNode.id === this.activeForm,
        enableTabStrip: element.getBooleanAttribute('strip') ?? true,
      };
    }
    return null;
  }

  /** Ожидается элемент `<tabs/>`. */
  private createTabSet(element: XElement): IJsonTabSetNode | null {
    const children = element.getChildren().map(c => this.createTabSetChild(c)).filter(Boolean);
    if (!children || children.length == 0) return null;

    let selected = element.getIntAttribute('selected') ?? 0;
    if (selected < 0 || selected > children.length - 1) selected = 0;

    return {
      type: 'tabset', children, selected,
      weight: element.getNumberAttribute('weight'),
      minWidth: element.getNumberAttribute('minWidth') || undefined,
      minHeight: element.getNumberAttribute('minHeight') || undefined,
      maximized: element.getBooleanAttribute('maximized') ?? false,
      active: children.some(c => c.id === this.activeForm),
    };
  }

  private createTabSetChild(element: XElement): IJsonTabNode | null {
    const name = element.getName();
    if (name === 'client') return this.createTab(element);

    if (name === 'row') {
      const row = this.createRow(element);
      if (!row) return null;

      const rootOrientationVertical = element.getAttribute('orientation') === 'vertical';
      const global: IGlobalAttributes = {...globalAttributes, rootOrientationVertical};
      const model = Model.fromJson({global, layout: row});

      const title = element.getAttribute('title');
      return {type: 'tab', name: title, component: 'layout', config: model};
    }
    return null;
  }

  /** Ожидается элемент `<client/>`. */
  private createTab(element: XElement): IJsonTabNode | null {
    const name = element.getAttribute('name');
    const title = element.getAttribute('title');
    return this.createTabNode(name, title);
  }

  /* --- Legacy Format --- */

  private createLegacy(element: XElement): Model | null {
    const main = element?.getChildThrough('RadDocking', 'DocumentHost', 'RadSplitContainer');
    if (!main) return null;
    const row = this.createRowLegacy(main);
    if (!row) return null;
    row.id = 'legacy'; // format marker
    const rootOrientationVertical = main.getAttribute('Orientation') === 'Vertical';
    return Model.fromJson({global: {...globalAttributes, rootOrientationVertical}, layout: row});
  }

  /** Ожидается элемент `<RadSplitContainer/>`. */
  private createRowLegacy(element: XElement): IJsonRowNode | null {
    const toChild = (e: XElement) => {
      if (e.getName() === 'RadPaneGroup') return this.createTabSetLegacy(e);
      return this.createRowLegacy(e);
    };
    const itemElement = element.getChild('Items');
    const items = itemElement?.getChildren(['RadPaneGroup', 'RadSplitContainer']);

    const children = items?.map(toChild).filter(Boolean);
    if (!children || children.length == 0) return null;

    const weight = element.getNumberAttribute('SplitterChange');
    return {type: 'row', weight, children};
  }

  /** Ожидается элемент `<RadPaneGroup/>`. */
  private createTabSetLegacy(element: XElement): IJsonTabSetNode | null {
    const toTab = (e: XElement): IJsonTabNode => {
      const id = e.getAttribute('SerializationTag');
      const title = e.getAttribute('Title');
      return this.createTabNode(id, title);
    };
    const panes = element.getChildrenThrough('Items', 'RadPane');
    const children = panes?.map(toTab).filter(Boolean);
    if (!children || children.length == 0) return null;

    let selected = element.getIntAttribute('SelectedIndex') ?? 0;
    if (selected < 0 || selected > children.length - 1) selected = 0;

    const weight = element.getNumberAttribute('SplitterChange');
    const maximized = element.getBooleanAttribute('Maximized');
    const active = children.some(c => c.id === this.activeForm);
    return {type: 'tabset', weight, selected, maximized, active, children};
  }

  /* --- --- */

  private createTabNode(id: string, title: string): IJsonTabNode | null {
    if (!id) return null;
    id = this.id + ',' + id;
    const form = this.forms.find(f => f.id === id);
    if (!form) return null;

    const node: IJsonTabNode = {type: 'tab', id, config: form};
    if (form.displayNameString) {
      node.name = createElement(FormHeader, {template: form.displayNameString}) as any;
    } else if (!node.name) {
      node.name = title || form.displayName;
    }
    return node;
  }

  public createDefault(): Model {
    const children = this.forms.map(form => this.createDefaultTabNode(form));
    const layout: IJsonRowNode = {type: 'row', children};
    return Model.fromJson({global: globalAttributes, layout});
  }

  private createDefaultTabNode(form: FormDataWM): IJsonTabSetNode {
    const template = form.displayNameString;
    const name: any = template ? createElement(FormHeader, {template}) : form.displayName;
    const tab: IJsonTabNode = {id: form.id, type: 'tab', name, config: form};
    return {type: 'tabset', selected: 0, active: form.id === this.activeForm, children: [tab]};
  }
}
