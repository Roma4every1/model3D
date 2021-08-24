import React from 'react';
import FormHeader from './FormHeader';
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
                formData={formData}
                {...other}
            />
    }
    else {
        contents = 
        <div>
            <FormHeader sessionId={sessionId} formData={formData} {...other}/>
            <div className="imgbox">
                <img src={getImagePath(formData.type)} alt="logo" />
            </div>
        </div>
    }

    return (contents);
}
