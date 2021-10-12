import { ParametersList } from './ParametersList';
import { useSelector } from 'react-redux';
import { globals } from './Globals';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PresentationParametersList(props) {
    const sessionManager = useSelector((state) => state.sessionManager);
    const { formId, ...other } = props;
  //  const [parametersJSON, setParametersJSON] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const { t } = useTranslation();

    const parametersJSON = useSelector((state) => state.formParams[formId]);

    //React.useEffect(() => {
    //    let ignore = false;

    //    if (formId) {
    //        async function fetchData() {
    //            await sessionManager.paramsManager.loadFormParameters(formId);



    //            if (!ignore) {
    //                setParametersJSON(globals.formParameters[formId]);
    //                setLoading(false);
    //            }
    //        }

    //        fetchData();
    //    }
    //    return () => { ignore = true; }
    //}, [formId, sessionManager]);

    const updateEditedParametersList = (parametersJSON) => {
       // sessionManager.paramsManager.()

        //if (!globals.formParameters) {
        //    globals.formParameters = {}
        //}
        //globals.formParameters[formId] = parametersJSON;
        //setParametersJSON(parametersJSON);
    };

    return (
        <div>
            {!parametersJSON
                ? <p><em>{t('base.loading')}</em></p>
                : <ParametersList parametersJSON={parametersJSON} setMainEditedJSON={updateEditedParametersList} {...other} />}
        </div>
    );
}

