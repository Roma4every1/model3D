import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import setSeriesSettings from "../../../../store/actionCreators/setSeriesSettings";

export default function SeriesSettings(props) {
    const { formId } = props;
    const sessionId = useSelector((state) => state.sessionId);
    const sessionManager = useSelector((state) => state.sessionManager);

    const dispatch = useDispatch();

    React.useEffect(() => {
        let ignore = false;
        if (sessionId) {
            async function fetchData() {
                const data = await sessionManager.fetchData(`pluginData?sessionId=${sessionId}&formId=${formId}&pluginName=chartSeriesSettings`);
                if (!ignore && data) {
                    dispatch(setSeriesSettings(formId, data.chartSeriesSettings));
                }
            }
            fetchData();
        }
        return () => { ignore = true; }
    }, [sessionId, formId, sessionManager, dispatch]);

    return <div/>;
}