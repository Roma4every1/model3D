import { useSelector } from "react-redux";
import BaseEditor from "../editors/base-editor";


const filterParams = (p: FormParameter) => Boolean(p.editorType);
const sortParams = (a: FormParameter, b: FormParameter) => a.editorDisplayOrder - b.editorDisplayOrder;
const paramsManagerSelector = (state: WState) => state.sessionManager.paramsManager;

/** Компонент списка параметров. */
export default function ParametersList({parametersJSON}: {parametersJSON: FormParameter[]}) {
  const paramsManager = useSelector(paramsManagerSelector);

  const updateEditedJSON = (action, formID: FormID) => {
    const { name, value, manual } = action.target;
    paramsManager.updateParamValue(formID, name, action.value ?? value, manual ?? true);
  };

  const paramToEditor = (param: FormParameter, i: number) => {
    return (
      <BaseEditor
        key={i}
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
  };

  return (
    <div className={'parameters-list'}>
      {parametersJSON.filter(filterParams).sort(sortParams).map(paramToEditor)}
    </div>
  );
}
