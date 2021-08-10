import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { BaseEditor } from './activeParametersEditors/BaseEditor';

export function ParametersList(props) {
    const { parametersJSON } = props;

    return (
        <List>
            {parametersJSON.map(parameterJSON =>
                <div>
                    <ListItem>
                        <BaseEditor
                            editorType={parameterJSON.editorType}
                            id={parameterJSON.id}
                            displayName={parameterJSON.displayName}
                        />
                    </ListItem>
                </div>
            )}
        </List>
        )
}