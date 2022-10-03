import React from "react";
import { useSelector } from "react-redux";
import Form from "../Form";
import { selectors } from "../../../store";


export default function DockForm({formId}) {
  const activeChildData = useSelector(selectors.activeChild.bind(formId));
  return activeChildData ? <Form key={activeChildData.id} formData={activeChildData}/> : null;
}
