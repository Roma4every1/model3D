import React from 'react';
import FormHeader from './Form/FormHeader';

export default function Screenshot(props) {
    const { formData } = props;

    const getImagePath = (formType) => {
        if (process.env.PUBLIC_URL) {
            return process.env.PUBLIC_URL + '/images/' + formType + '.PNG';
        }
        else {
            return '/images/' + formType + '.PNG';
        }
    }

    return (
        <div>
            <FormHeader formData={formData} />
            <div className="imgbox">
                <img src={getImagePath(formData.type)} alt="logo" />
            </div>
        </div>
    );
}
