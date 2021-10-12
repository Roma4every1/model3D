import React from 'react';
import {
    Toolbar,
    ToolbarItem
} from "@progress/kendo-react-buttons";
import LocalFormParametersList from './LocalFormParametersList';

export default function FormHeader(props) {
    const { formData, additionalButtons } = props;

    return (
        <div className='blockheader'>
            <Toolbar className='blockheadertoolbar'>
                <ToolbarItem>
                    <LocalFormParametersList formId={formData.id} />
                    {additionalButtons}
                </ToolbarItem>
                <ToolbarItem>
                    <h5>{formData.displayName}</h5>
                </ToolbarItem>
            </Toolbar>
        </div>
    );
}
