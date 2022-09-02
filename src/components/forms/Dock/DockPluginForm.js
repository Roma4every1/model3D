import React from "react";
import { useSelector } from "react-redux";


export default function DockPluginForm({formId, FormByType}) {
  const activeChild = useSelector((state) => {
    const childForm = state.childForms[formId];
    return childForm?.children.find(x => x.id === (childForm.openedChildren[0]));
  });
  return activeChild && activeChild.id ? <FormByType formId={activeChild.id} /> : null;
}
