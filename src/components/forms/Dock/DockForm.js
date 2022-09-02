import React from "react";
import { useSelector } from "react-redux";
import Form from "../Form";


export default function DockForm({formId}) {
  const activeChild = useSelector((state) => {
    const childForm = state.childForms[formId];
    return childForm?.children.find(x => x.id === (childForm.openedChildren[0]));
  });
  return activeChild ? <Form key={activeChild.id} formData={activeChild}/> : null;
}
