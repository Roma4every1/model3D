import React from 'react';
import { useSelector } from 'react-redux';
import { StackLayout } from "@progress/kendo-react-layout";
import BaseEditor from '../activeParametersEditors/BaseEditor';

export default function ParametersList(props) {
    const paramsManager = useSelector((state) => state.sessionManager.paramsManager);
    const { parametersJSON } = props;

    const updateEditedJSON = (action, formId) => {
        const target = action.target;
        const newValue = action.value ?? target.value;
        paramsManager.updateParamValue(formId, target.name, newValue, target.manual ?? true);
    };

    return (
        <StackLayout orientation="vertical">
            {parametersJSON.filter(parameterJSON => parameterJSON.editorType).sort((a, b) => a.editorDisplayOrder - b.editorDisplayOrder).map(parameterJSON =>
                <BaseEditor
                    editorType={parameterJSON.editorType}
                    key={parameterJSON.id}
                    id={parameterJSON.id}
                    formId={parameterJSON.formId}
                    formIdToLoad={parameterJSON.formIdToLoad}
                    displayName={parameterJSON.displayName}
                    value={parameterJSON.value}
                    externalChannelName={parameterJSON.externalChannelName}
                    selectionChanged={(action) => updateEditedJSON(action, parameterJSON.formId)}
                />
            )}
        </StackLayout>
    );
}