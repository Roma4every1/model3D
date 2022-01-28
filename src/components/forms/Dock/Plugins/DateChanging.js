import React from 'react';
import { useSelector } from 'react-redux';
import DateChangingRule from "./DateChangingRule";

export default function DateChanging(props) {
    const { formId } = props;

    const sessionId = useSelector((state) => state.sessionId);
    const sessionManager = useSelector((state) => state.sessionManager);
    const [pluginData, setPluginData] = React.useState(null);

    React.useEffect(() => {
        let ignore = false;
        if (sessionId) {
            async function fetchData() {
                const data = await sessionManager.fetchData(`pluginData?sessionId=${sessionId}&formId=${formId}&pluginName=dateChanging`);
                if (!ignore && data) {
                    setPluginData(data);
                }
            }
            fetchData();
        }
        return () => { ignore = true; }
    }, [sessionId, formId, sessionManager]);

    return (pluginData?.dateChanging ?
        <DateChangingRule
            yearParameter={pluginData?.dateChanging['@yearParameter']}
            dateIntervalParameter={pluginData?.dateChanging['@dateIntervalParameter']}
            columnNameParameter={pluginData?.dateChanging['@columnNameParameter']}
            formId={formId}
        /> : <div />);
}