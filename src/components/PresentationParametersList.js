import { ParametersList } from './ParametersList';
import { useSelector } from 'react-redux';
import { globals } from './Globals';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PresentationParametersList(props) {
    const sessionManager = useSelector((state) => state.sessionManager);
    const { presentationId, ...other } = props;
    const [parametersJSON, setParametersJSON] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const { t } = useTranslation();

    React.useEffect(() => {
        let ignore = false;

        if (presentationId) {
            async function fetchData() {
                await sessionManager.paramsManager.loadFormParameters(presentationId);
                if (!ignore) {
                    setParametersJSON(globals.presentationParameters[presentationId]);
                    setLoading(false);
                }
            }

            fetchData();
        }
        return () => { ignore = true; }
    }, [presentationId, sessionManager]);

    const updateEditedParametersList = (parametersJSON) => {
        if (!globals.presentationParameters) {
            globals.presentationParameters = {}
        }
        globals.presentationParameters[presentationId] = parametersJSON;
        setParametersJSON(parametersJSON);
    };

    return (
        <div>
            {loading
                ? <p><em>{t('base.loading')}</em></p>
                : <ParametersList parametersJSON={parametersJSON} setMainEditedJSON={updateEditedParametersList} {...other} />}
        </div>
    );
}

