import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ParametersList } from './ParametersList';

export default function GlobalParametersList() {
    const { t } = useTranslation();

    const parametersJSON = useSelector((state) => state.globalParams);

    return (
        <div>
            {!parametersJSON
                ? <p><em>{t('base.loading')}</em></p>
                : <ParametersList parametersJSON={parametersJSON} />
            }
        </div>
    );
}

