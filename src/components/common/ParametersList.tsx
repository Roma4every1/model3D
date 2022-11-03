import { useCallback } from "react";
import { useSelector } from "react-redux";
import BaseEditor from "../editors/BaseEditor";


/** Функция сортировки параметров. */
const sortParams = (a: FormParameter, b: FormParameter) => a.editorDisplayOrder - b.editorDisplayOrder;
const paramsManagerSelector = (state: WState) => state.sessionManager.paramsManager;

/** Компонент списка параметров. */
export default function ParametersList(props) {
  const paramsManager = useSelector(paramsManagerSelector);

  const updateEditedJSON = useCallback((action, formID: FormID) => {
    const { name, value, manual } = action.target;
    paramsManager.updateParamValue(formID, name, action.value ?? value, manual ?? true);
  }, [paramsManager]);

  const paramToEditor = useCallback((param: FormParameter) => {
    return (
      <BaseEditor
        key={param.id}
        editorType={param.editorType}
        id={param.id}
        formId={param.formId}
        formIdToLoad={(param as any).formIdToLoad} // ???
        displayName={param.displayName}
        value={param.value}
        externalChannelName={param.externalChannelName}
        selectionChanged={(action) => updateEditedJSON(action, param.formId)}
      />
    );
  }, [updateEditedJSON]);

  return (
    <div className={'parameters-list'}>
      {props.parametersJSON.filter(param => param.editorType).sort(sortParams).map(paramToEditor)}
    </div>
  );
}
