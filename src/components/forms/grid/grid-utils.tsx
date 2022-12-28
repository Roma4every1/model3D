import { IJsonModel, IJsonRowNode } from "flexlayout-react/declarations/model/IJsonModel";
import { IJsonTabNode, IJsonTabSetNode } from "flexlayout-react/declarations/model/IJsonModel";
import Form from "../form/form";
import FormDisplayName from "../form/form-display-name";


type LayoutArg = IJsonRowNode | IJsonTabSetNode | IJsonTabNode;


export function createLayout(forms: FormDataWMR[] = [], active: FormID = undefined): IJsonModel {
  const children = forms.map(form => createTabSetNode(form, active));
  return {
    global: {rootOrientationVertical: false, splitterSize: 4},
    layout: {type: 'row', children},
  };
}

export function fillLayout(layout: LayoutArg, forms: FormDataWMR[], active: FormID) {
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

/* --- --- */

function createTabSetNode(form: FormDataWMR, active: FormID): IJsonTabSetNode {
  return {
    type: 'tabset', selected: 0, active: form.id === active,
    children: [{
      id: form.id, type: 'tab', name: form.displayName,
      component: <Form key={form.id} formData={form} data={undefined}/> as any,
    }],
  };
}

function fillTabNode(node: IJsonTabNode, form: FormDataWMR) {
  if (form.displayNameString) {
    // @ts-ignore
    node.name = <FormDisplayName formID={form.id} pattern={form.displayNameString}/>;
  } else {
    node.name = form.displayName;
  }
  // @ts-ignore
  node.component = <Form key={form.id} formData={form} data={undefined}/>
}

/* --- --- */

/** Является ли форма мультикартой (т.е. содержит несколько карт). */
export const isMultiMap = (children: FormChildren) => {
  return children && children.filter(child => child.type === 'map').length > 1;
};
/** Возвращает список форм-карт мультикарты. */
export const getMultiMapChildrenID = (children: FormChildren) => {
  return children.filter(child => child.type === 'map').map(child => child.id);
};
