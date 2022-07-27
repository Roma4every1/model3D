import React from "react";
import { useSelector } from "react-redux";
import { StackLayout } from "@progress/kendo-react-layout";
import BaseEditor from "../editors/BaseEditor";


/** Функция сортировки параметров. */
const sortParams = (a, b) => a.editorDisplayOrder - b.editorDisplayOrder;

/** Компонент списка параметров. */
export default function ParametersList(props) {
  const updateParamValue = useSelector((state) => state.sessionManager.paramsManager.updateParamValue);

  const updateEditedJSON = (action, formID) => {
    const target = action.target;
    updateParamValue(formID, target.name, action.value ?? target.value, target.manual ?? true);
  };

  return (
    <StackLayout orientation="vertical">
      {props.parametersJSON.filter(param => param.editorType).sort(sortParams).map(param =>
        <BaseEditor
          key={param.id}
          editorType={param.editorType}
          id={param.id}
          formId={param.formId}
          formIdToLoad={param.formIdToLoad}
          displayName={param.displayName}
          value={param.value}
          externalChannelName={param.externalChannelName}
          selectionChanged={(action) => updateEditedJSON(action, param.formId)}
        />
      )}
    </StackLayout>
  );
}
