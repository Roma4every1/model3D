import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import BaseEditor from './activeParametersEditors/BaseEditor';

export function ParametersList(props) {
    const { parametersJSON, setMainEditedJSON } = props;
    const [editedJSON, setEditedJSON] = React.useState(parametersJSON);
    const [updatedParam, setUpdatedParam] = React.useState({});

    return (
        <List>
            {parametersJSON.map(parameterJSON =>
                    <ListItem key={parameterJSON.id}>
                        <BaseEditor
                        editorType={parameterJSON.editorType}
                        key={parameterJSON.id}
                        id={parameterJSON.id}
                        displayName={parameterJSON.displayName}
                        value={parameterJSON.value}
                        updatedParam={updatedParam}
                        selectionChanged={(event) => {
                            var changedJSON = editedJSON;
                            changedJSON.forEach(element => {
                                if (element.id === event.target.name) {
                                    element.value = event.target.value;
                                }
                            });
                            setEditedJSON(changedJSON);
                            setMainEditedJSON(changedJSON);
                            setUpdatedParam(event.target);
                        }}
                        />
                    </ListItem>
            )}
        </List>
        )
}