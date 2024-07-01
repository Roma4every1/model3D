import type {
  IGlobalAttributes, IJsonModel,
  IJsonRowNode, IJsonTabNode, IJsonTabSetNode,
} from 'flexlayout-react/declarations/model/IJsonModel';

import { Model } from 'flexlayout-react';
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

  constructor(forms: FormDataWM[], active: FormID) {
    this.forms = forms;
    this.activeForm = active;
  }

  public create(init: IJsonModel): Model {
    if (init?.layout?.children) {
      init.global = {...globalAttributes, ...init.global};
      this.handleNode(init.layout);
      return Model.fromJson(init);
    } else {
      return this.createDefaultLayout();
    }
  }

  private handleNode(node: IJsonRowNode | IJsonTabSetNode | IJsonTabNode): void {
    switch (node.type) {
      case 'row': { this.handleRowNode(node as IJsonRowNode); break; }
      case 'tabset': { this.handleTabSetNode(node as IJsonTabSetNode); break; }
      case 'tab': { this.handleTabNode(node); break; }
    }
  }

  private handleRowNode(node: IJsonRowNode): void {
    node.children?.forEach(child => this.handleNode(child));
  }

  private handleTabSetNode(node: IJsonTabSetNode): void {
    node.children?.forEach(child => this.handleNode(child));
    node.active = node.children.some(child => child.id === this.activeForm);
  }

  private handleTabNode(node: IJsonTabNode): void {
    const form = this.forms.find(f => f.id === node.id);
    if (!form) return;

    if (form.displayNameString) {
      node.name = createElement(FormName, {pattern: form.displayNameString}) as any;
    } else {
      node.name = node['title'] ?? form.displayName;
    }
    node.component = createElement(Form, form) as any;
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
