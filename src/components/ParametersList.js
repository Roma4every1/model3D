import React from 'react';
import { StackLayout } from "@progress/kendo-react-layout";
import BaseEditor from './activeParametersEditors/BaseEditor';

export function ParametersList(props) {
    const { parametersJSON, setMainEditedJSON, selectionChanged } = props;
    const [editedJSON, setEditedJSON] = React.useState(parametersJSON);
    const [updatedParam, setUpdatedParam] = React.useState({});

    return (
        <StackLayout orientation="vertical">
            {parametersJSON.map(parameterJSON =>
                <BaseEditor
                    editorType={parameterJSON.editorType}
                    key={parameterJSON.id}
                    id={parameterJSON.id}
                    displayName={parameterJSON.displayName}
                    value={parameterJSON.value}
                    updatedParam={updatedParam}
                    selectionChanged={(event) => {
                        var changedJSON = editedJSON;
                        var target = event.target
                        changedJSON.forEach(element => {
                            if (element.id === target.name) {
                                element.value = target.value;
                            }
                        });
                        setEditedJSON(changedJSON);
                        setMainEditedJSON(changedJSON);
                        setUpdatedParam(target);
                        if (selectionChanged) {
                            selectionChanged(target);
                        }
                    }}
                />
            )}
        </StackLayout>
    );
}