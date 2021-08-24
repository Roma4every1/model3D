import { ParametersList } from './ParametersList';
import { globals } from './Globals';
import React from 'react';
import { useTranslation } from 'react-i18next';
var utils = require("../utils")

export default function GlobalParametersList(props) {
    const { sessionId, ...other } = props;
    const [parametersJSON, setParametersJSON] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const { t } = useTranslation();

    React.useEffect(() => {
        let ignore = false;

        if (sessionId) {
            async function fetchData() {
                const response = await utils.webFetch(`getGlobalParameters?sessionId=${sessionId}`);
                const responseJSON = await response.json();
                globals.globalParameters = responseJSON;
                if (!ignore) {
                    setParametersJSON(responseJSON);
                    setLoading(false);
                }
            }

            fetchData();
        }
        return () => { ignore = true; }
    }, [sessionId]);

    const updateEditedParametersList = (parametersJSON) => {
        globals.globalParameters = parametersJSON;
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

