import React from 'react';
import FormHeader from './Form/FormHeader';

export default function Screenshot(props) {
    const { formData } = props;

    const getImagePath = (formType) => {
        return window.location.pathname + 'images/' + formType + '.PNG';
    }

    return (
        <div className="screenshot-container">
            <FormHeader formData={formData} />
            <div className="imgbox">
                <img src={getImagePath(formData.type)} alt="logo" />
            </div>
        </div>
    );
}
