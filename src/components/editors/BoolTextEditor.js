import React from "react";
import { useSelector } from "react-redux";
import { Checkbox } from "@progress/kendo-react-inputs";


export default function BoolTextEditor({id, formId, selectionChanged}) {
  let value = useSelector((state) => state.formParams[formId]
    .find((gp) => gp.id === id).value);

  value = value && (typeof value !== 'string' || value.toLowerCase() !== 'false');

  const onChange = (e) => {
    selectionChanged({target: {name: e.target.name, value: e.target.value}});
  }

  return <Checkbox id={id} name={id} value={value} onChange={onChange}/>;
}
