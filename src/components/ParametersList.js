import React from 'react';
import { useSelector } from 'react-redux';
import { StackLayout } from "@progress/kendo-react-layout";
import BaseEditor from './activeParametersEditors/BaseEditor';

export function ParametersList(props) {
    const paramsManager = useSelector((state) => state.sessionManager.paramsManager);
    const { parametersJSON } = props;

    const updateEditedJSON = (action) => {
        var target = action.target;
        var newValue = action.value ?? target.value;
        paramsManager.updateParam(target.formId, target.name, newValue, target.manual);
    }

    return (
        <StackLayout orientation="vertical">
            {parametersJSON.map(parameterJSON =>
                <BaseEditor
                    editorType={parameterJSON.editorType}
                    key={parameterJSON.id}
                    id={parameterJSON.id}
                    formId={parameterJSON.formId}
                    displayName={parameterJSON.displayName}
                    value={parameterJSON.value}
                    selectionChanged={updateEditedJSON}
                />
            )}
        </StackLayout>
    );
}