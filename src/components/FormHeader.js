import React from 'react';
import {
    Toolbar,
    ToolbarItem
} from "@progress/kendo-react-buttons";
import FormParametersList from './FormParametersList';

export default function FormHeader(props) {
    const { sessionId, formData, additionalButtons, ...other } = props;

    return (
        <div className='blockheader'>
            <Toolbar className='blockheadertoolbar'>
                <ToolbarItem>
                    <FormParametersList sessionId={sessionId} formId={formData.id} {...other} />
                    {additionalButtons}
                </ToolbarItem>
                <ToolbarItem>
                    <h5>{formData.displayName}</h5>
                </ToolbarItem>
            </Toolbar>
        </div>
    );
}
