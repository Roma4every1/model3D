import { IGlobalAttributes } from 'flexlayout-react/declarations/model/IJsonModel';
import { IJsonModel, IJsonRowNode } from 'flexlayout-react/declarations/model/IJsonModel';
import { IJsonTabNode, IJsonTabSetNode } from 'flexlayout-react/declarations/model/IJsonModel';
import { Form } from '../components/form';
import { FormName } from '../components/form-name';


type LayoutArg = IJsonRowNode | IJsonTabSetNode | IJsonTabNode;


const gridLayoutGlobalAttrs: IGlobalAttributes = {
  rootOrientationVertical: false,
  tabEnableRename: false,
  tabEnableClose: false,
  tabEnableDrag: false,
  tabSetEnableDrag: false,
  tabSetTabStripHeight: 26,
  splitterSize: 6,
};

export function handleLayout(data: IJsonModel, children: FormDataWM[], activeID: FormID): IJsonModel {
  let formLayout: IJsonModel;
  if (data?.layout?.children) {
    formLayout = data;
    formLayout.global = {...gridLayoutGlobalAttrs, ...formLayout.global};
    fillLayout(formLayout.layout, children, activeID);
  } else {
    formLayout = createLayout(children, activeID);
  }
  return formLayout;
}

function fillLayout(layout: LayoutArg, forms: FormDataWM[], active: FormID) {
  if (layout.type === 'tabset') {
    // @ts-ignore
    layout.active = layout.children.some(child => child.id === active);
  } else if (layout.type === 'tab') {
    const form = forms.find(f => f.id === layout.id);
    if (form) fillTabNode(layout, form);
  }
  // @ts-ignore
  layout.children?.forEach(child => fillLayout(child, forms, active));
}

function fillTabNode(node: IJsonTabNode, form: FormDataWM): void {
  if (form.displayNameString) {
    node.name = <FormName formID={form.id} pattern={form.displayNameString}/> as any;
  } else {
    node.name = node['title'] ?? form.displayName;
  }
  node.component = <Form id={form.id} type={form.type}/> as any;
}

/* --- --- */

function createLayout(forms: FormDataWM[], active: FormID): IJsonModel {
  const children = forms.map(form => createTabSetNode(form, active));
  return {
    global: gridLayoutGlobalAttrs,
    layout: {type: 'row', children},
  };
}

function createTabSetNode(form: FormDataWM, active: FormID): IJsonTabSetNode {
  return {
    type: 'tabset', selected: 0, active: form.id === active,
    children: [{
      id: form.id, type: 'tab', name: form.displayName,
      component: <Form id={form.id} type={form.type}/> as any,
    }],
  };
}
