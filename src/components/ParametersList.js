import React from 'react';
import { StackLayout } from "@progress/kendo-react-layout";
import BaseEditor from './activeParametersEditors/BaseEditor';

export function ParametersList(props) {
    const { parametersJSON, setMainEditedJSON, selectionChanged, ...other } = props;
    const [editedJSON, updateEditedJSON] = React.useReducer(editedJSONReducer, { values: parametersJSON, updatedParam: {} });
    const [updatedParam, setUpdatedParam] = React.useState({});

    function editedJSONReducer(state, action) {
        var changedJSON = state.values;
        var target = action.target
        changedJSON.forEach(element => {
            if (element.id === target.name) {
                element.value = target.value;
            }
        });
        return { values: changedJSON, updatedParam: target};
    }

    React.useEffect(() => {
        if (editedJSON.updatedParam) {
            setMainEditedJSON(editedJSON.values);
        }
        setUpdatedParam(editedJSON.updatedParam);
        if (selectionChanged) {
            selectionChanged(editedJSON.updatedParam);
        }
    }, [editedJSON, selectionChanged]);

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
                    selectionChanged={updateEditedJSON}
                    {...other}
                />
            )}
        </StackLayout>
    );
}