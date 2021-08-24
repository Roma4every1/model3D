import React from 'react';
import {
    Toolbar
} from "@progress/kendo-react-buttons";
import FormParametersList from './FormParametersList';

export default function FormHeader(props) {
    const { sessionId, formData, additionalButtons, ...other } = props;

    return (
        <div className='blockheader'>
            <Toolbar>
                <FormParametersList sessionId={sessionId} formId={formData.id} {...other} />
                {additionalButtons}
                <h6>{formData.displayName}</h6>
            </Toolbar>
        </div>
    );
}
