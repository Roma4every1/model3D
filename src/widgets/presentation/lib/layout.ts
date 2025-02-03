import type {
  IGlobalAttributes, IJsonModel,
  IJsonRowNode, IJsonTabNode, IJsonTabSetNode,
} from 'flexlayout-react/declarations/model/IJsonModel';

import { Model, RowNode, TabSetNode, Actions } from 'flexlayout-react';
import { createElement } from 'react';
import { Form } from '../components/form';
import { FormName } from '../components/form-name';


const globalAttributes: IGlobalAttributes = {
  rootOrientationVertical: false,
  tabEnableRename: false,
  tabEnableClose: false,
  tabEnableDrag: false,
  tabSetEnableDrag: false,
  tabSetTabStripHeight: 26,
  splitterSize: 6,
};

export class LayoutFactory {
  private readonly forms: FormDataWM[];
  private readonly activeForm: FormID;
  private model: Model;

  constructor(forms: FormDataWM[], active: FormID) {
    this.forms = forms;
    this.activeForm = active;
  }

  public create(init: IJsonModel): Model {
    if (init?.layout?.children) {
      init.global = {...globalAttributes, ...init.global};
      this.handleRowNode(init.layout);
      this.model = Model.fromJson(init);
    } else {
      this.model = this.createDefaultLayout();
    }
    return this.model;
  }

  public getChildren(): Pick<SessionClient, 'openedChildren' | 'childrenTypes' | 'activeChildID'> {
    const openedChildren: Set<ClientID> = new Set();
    const childrenTypes: Set<ClientType> = new Set();

    const traverse = (node: RowNode | TabSetNode) => {
      const type = node.getType();
      const children = node.getChildren();

      if (type === 'row') return children.forEach(traverse);
      if (type !== 'tabset') return;

      for (const child of children) {
        const id = child.getId();
        childrenTypes.add(this.forms.find(f => f.id === id).type);
      }
      const activeTab = children[(node as TabSetNode).getSelected()];
      if (activeTab) openedChildren.add(activeTab.getId());
    };
    traverse(this.model.getRoot());

    let activeChildID: ClientID = null;
    let activeTabset = this.model.getActiveTabset();

    if (!activeTabset && openedChildren.size) {
      activeChildID = openedChildren.values().next().value;
      this.model.doAction(Actions.selectTab(activeChildID));
    }
    if (activeTabset && activeChildID === null) {
      const activeTab = activeTabset.getChildren()[activeTabset.getSelected()];
      if (activeTab) activeChildID = activeTab.getId();
    }
    return {openedChildren, childrenTypes, activeChildID};
  }

  /* --- --- */

  private handleRowNode(node: IJsonRowNode): void {
    node.children?.forEach((child: IJsonRowNode | IJsonTabSetNode) => {
      if (child.type === 'row') return this.handleRowNode(child);
      if (child.type === 'tabset') return this.handleTabSetNode(child);
    });
  }

  private handleTabSetNode(node: IJsonTabSetNode): void {
    const children: IJsonTabNode[] = [];
    for (const child of node.children) {
      if (!this.handleTabNode(child)) continue;
      children.push(child);
      if (child.id === this.activeForm) node.active = true;
    }
    node.children = children;
  }

  private handleTabNode(node: IJsonTabNode): boolean {
    const form = this.forms.find(f => f.id === node.id);
    if (!form) return false;

    if (form.displayNameString) {
      node.name = createElement(FormName, {pattern: form.displayNameString}) as any;
    } else {
      node.name = node['title'] ?? form.displayName;
    }
    node.component = createElement(Form, form) as any;
    return true;
  }

  /* --- --- */

  private createDefaultLayout(): Model {
    const children = this.forms.map(form => this.createDefaultTabNode(form));
    const layout: IJsonRowNode = {type: 'row', children};
    return Model.fromJson({global: globalAttributes, layout});
  }

  private createDefaultTabNode(form: FormDataWM): IJsonTabSetNode {
    const child: IJsonTabNode = {
      id: form.id, type: 'tab', name: form.displayName,
      component: createElement(Form, form) as any,
    };
    return {type: 'tabset', selected: 0, active: form.id === this.activeForm, children: [child]};
  }
}
