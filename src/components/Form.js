import React from 'react';
import {
    Toolbar
} from "@progress/kendo-react-buttons";
import FormParametersList from './FormParametersList';
import TableForm from './forms/TableForm';

export default function Form(props) {
    const { sessionId, formData, ...other } = props;

    const getImagePath = (formType) => {
        return process.env.PUBLIC_URL + '/images/' + formType + '.PNG';
    }

    var contents = '';
    if (formData.type === 'dataSet') {
        contents =
            <TableForm
                sessionId={sessionId}
                formId={formData.id}
                {...other}
            />
    }
    else {
        contents = <div className="imgbox">
            <img src={getImagePath(formData.type)} alt="logo" />
        </div>
    }

    return (
        <div>
            <div className='blockheader'>
                <Toolbar>
                    <FormParametersList sessionId={sessionId} formId={formData.id} {...other} />
                    <h6>{formData.displayName}</h6>
                </Toolbar>
            </div>
            {contents}
        </div>
    );
}
