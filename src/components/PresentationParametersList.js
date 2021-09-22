import { ParametersList } from './ParametersList';
import { globals } from './Globals';
import React from 'react';
import { useTranslation } from 'react-i18next';
var utils = require("../utils")

export default function PresentationParametersList(props) {
    const { sessionId, presentationId, ...other } = props;
    const [parametersJSON, setParametersJSON] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const { t } = useTranslation();

    React.useEffect(() => {
        let ignore = false;

        if (sessionId && presentationId) {
            async function fetchData() {
                const response = await utils.webFetch(`getPresentationParameters?sessionId=${sessionId}&presentationId=${presentationId}`);
                const responseJSON = await response.json();
                if (!globals.presentationParameters) {
                    globals.presentationParameters = {}
                }
                var jsonToSet = responseJSON.map(param => { var newParam = param; newParam.presentationId = presentationId; return newParam; });
                globals.presentationParameters[presentationId] = jsonToSet;
                if (!ignore) {
                    setParametersJSON(jsonToSet);
                    setLoading(false);
                }
            }

            fetchData();
        }
        return () => { ignore = true; }
    }, [sessionId, presentationId]);

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

