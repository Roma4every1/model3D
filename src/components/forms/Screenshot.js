import React from 'react';
import FormHeader from '../FormHeader';

export default function Screenshot(props) {
    const { sessionId, formData, ...other } = props;

    const getImagePath = (formType) => {
        return process.env.PUBLIC_URL + '/images/' + formType + '.PNG';
    }

    return (
        <div>
            <FormHeader sessionId={sessionId} formData={formData} {...other} />
            <div className="imgbox">
                <img src={getImagePath(formData.type)} alt="logo" />
            </div>
        </div>
    );
}
