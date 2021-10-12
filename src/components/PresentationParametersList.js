import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ParametersList } from './ParametersList';

export default function PresentationParametersList(props) {
    const { formId } = props;
    const { t } = useTranslation();

    const parametersJSON = useSelector((state) => state.formParams[formId]);

    return (
        <div>
            {!parametersJSON
                ? <p><em>{t('base.loading')}</em></p>
                : <ParametersList parametersJSON={parametersJSON} />}
        </div>
    );
}
