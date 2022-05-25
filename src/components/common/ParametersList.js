import React from 'react';
import { useSelector } from 'react-redux';
import { StackLayout } from "@progress/kendo-react-layout";
import BaseEditor from '../activeParametersEditors/BaseEditor';


/*
param {
  id: string,
  type: string,
  value: any,
  formId: string,
  editorType: string,
  editorDisplayOrder: number, // в каком порядке отображать параметры
  externalChannelName: any,
  displayName: string,
  dependsOn: string[], // id других параметров
  canBeNull: boolean,
  showNullValue: boolean,
  nullDisplayValue: any,
}
*/

/** Функция сортировки параметров. */
const sortParams = (a, b) => a.editorDisplayOrder - b.editorDisplayOrder;


/** Компонент списка параметров. */
export default function ParametersList(props) {
    const updateParamValue = useSelector((state) => state.sessionManager.paramsManager.updateParamValue);
    const { parametersJSON } = props;

    const updateEditedJSON = (action, formId) => {
        const target = action.target;
        updateParamValue(formId, target.name, action.value ?? target.value, target.manual ?? true);
    };

    return (
        <StackLayout orientation="vertical">
            {parametersJSON.filter(param => param.editorType).sort(sortParams).map(param =>
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