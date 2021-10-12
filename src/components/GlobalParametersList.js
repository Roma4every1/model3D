import { ParametersList } from './ParametersList';
import { globals } from './Globals';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

export default function GlobalParametersList(props) {
    const { ...other } = props;
    const { t } = useTranslation();

    const parametersJSON = useSelector((state) => state.globalParams);

    const updateEditedParametersList = (parametersJSON) => {
       // globals.globalParameters = parametersJSON;
    };

    return (
        <div>
            {!parametersJSON
                ? <p><em>{t('base.loading')}</em></p>
                : <ParametersList parametersJSON={parametersJSON} setMainEditedJSON={updateEditedParametersList} {...other} />
            }
        </div>
    );
}

