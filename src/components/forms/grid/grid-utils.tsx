import { IJsonModel } from "flexlayout-react";
import Form from "../form/form";
import FormDisplayName from "../form/form-display-name";


export const pushElement = (json: IJsonModel, form: FormDataWMR, activeIds: ActiveChildrenList) => {
  json.layout.children.push({
    type: 'tabset',
    selected: 0,
    active: activeIds.includes(form.id),
    children: [{
      id: form.id, type: 'tab', name: form.displayName,
      // @ts-ignore
      component: <Form key={form.id} formData={form} data={undefined}/>
    }],
  });
};

export const correctElement = (layout, forms, activeIds) => {
  if (layout.type === 'tabset') {
    layout.active = layout.children.some(child => activeIds.includes(child.id))
  } else if (layout.type === 'tab') {
    const form = forms.find(f => f.id === layout.id);
    if (form) {
      if (!layout.title) {
        layout.name = <FormDisplayName formData={form} />;
      } else {
        layout.name = layout.title;
      }
      layout.component = <Form key={form.id} formData={form} data={undefined}/>
    }
  }

  if (layout.children) {
    layout.children.forEach(child => correctElement(child, forms, activeIds));
  }
};

/** Является ли форма мультикартой (т.е. содержит несколько карт). */
export const isMultiMap = (children: FormChildren) => {
  return children && children.filter(child => child.type === 'map').length > 1;
};
/** Возвращает список форм-карт мультикарты. */
export const getMultiMapChildrenID = (children: FormChildren) => {
  return children.filter(child => child.type === 'map').map(child => child.id);
};
