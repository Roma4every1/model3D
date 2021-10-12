import React from 'react';
import { useSelector } from 'react-redux';
import { StackLayout } from "@progress/kendo-react-layout";
import BaseEditor from './activeParametersEditors/BaseEditor';

export function ParametersList(props) {
    const paramsManager = useSelector((state) => state.sessionManager.paramsManager);
    const { parametersJSON, setMainEditedJSON, selectionChanged, ...other } = props;
 //   const [editedJSON, updateEditedJSON] = React.useReducer(editedJSONReducer, { values: parametersJSON, updatedParam: {} });
    const [updatedParam, setUpdatedParam] = React.useState({});

    const updateEditedJSON = (action) => {
        var target = action.target;
        var newValue = action.value ?? target.value;
        paramsManager.updateParam(target.formId, target.name, newValue, target.manual);
    }

    //function editedJSONReducer(state, action) {
    //    var changedJSON = state.values;
    //    var target = action.target;
    //    var newValue = action.value ?? target.value
    //    changedJSON.forEach(element => {
    //        if (element.id === target.name) {
    //            element.value = newValue;
    //        }
    //    });
    //    return { values: state.values, updatedParam: target};
    //}

    //React.useEffect(() => {
    //    if (editedJSON.updatedParam) {
    //        paramsManager.updateParam(editedJSON.updatedParam);
    //    }

    //    //if (editedJSON.updatedParam && setMainEditedJSON) {
    //    //    setMainEditedJSON(editedJSON.values);
    //    //}
    //    //setUpdatedParam(editedJSON.updatedParam);
    //    //if (selectionChanged) {
    //    //    selectionChanged(editedJSON.updatedParam);
    //    //}
    //}, [editedJSON, selectionChanged, setMainEditedJSON]);

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
                    dependsOn={parameterJSON.dependsOn}
                    //updatedParam={updatedParam}
                    selectionChanged={updateEditedJSON}
                    {...other}
                />
            )}
        </StackLayout>
    );
}