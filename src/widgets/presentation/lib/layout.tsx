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
  tabSetTabStripHeight: 26,
  splitterSize: 6,
};

export function handleLayout(res: Res<IJsonModel>, children: FormDataWMR[], activeID: FormID): IJsonModel {
  let formLayout: IJsonModel;
  if (res.ok && res.data?.layout?.children) {
    formLayout = res.data;
    formLayout.global = gridLayoutGlobalAttrs;
    fillLayout(formLayout.layout, children, activeID);
  } else {
    formLayout = createLayout(children, activeID);
  }
  return formLayout;
}

function fillLayout(layout: LayoutArg, forms: FormDataWMR[], active: FormID) {
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

function fillTabNode(node: IJsonTabNode, form: FormDataWMR) {
  const displayNamePattern = form.displayNamePattern;
  if (displayNamePattern) {
    const { pattern, params } = displayNamePattern;
    node.name = <FormName formID={form.id} pattern={pattern} params={params}/> as any;
  } else {
    node.name = form.displayName;
  }
  node.component = <Form formData={form}/> as any
}

/* --- --- */

function createLayout(forms: FormDataWMR[], active: FormID): IJsonModel {
  const children = forms.map(form => createTabSetNode(form, active));
  return {
    global: gridLayoutGlobalAttrs,
    layout: {type: 'row', children},
  };
}

function createTabSetNode(form: FormDataWMR, active: FormID): IJsonTabSetNode {
  return {
    id: form.id,
    type: 'tabset', selected: 0, active: form.id === active,
    children: [{
      id: form.id, type: 'tab', name: form.displayName,
      component: <Form formData={form}/> as any,
    }],
  };
}
