import React from 'react';
import { useSelector } from 'react-redux';
import { Loader } from "@progress/kendo-react-indicators";

import ParametersList from './ParametersList';

export default function FormParametersList(props) {
    const { formId } = props;    

    const parametersJSON = useSelector((state) => state.formParams[formId]);

    return (
        <div>
            {!parametersJSON
                ? <Loader size="small" type="infinite-spinner" />
                : <ParametersList parametersJSON={parametersJSON} />}
        </div>
    );
}
