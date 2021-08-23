import React from 'react';
import RecursiveTreeView from './RecursiveTreeView';
import { useTranslation } from 'react-i18next';
var utils = require("../utils")

export default function PresentationList(props) {
    const { t } = useTranslation();
    const { sessionId, selectionChanged } = props;
    const [state, setState] = React.useState({
        presentationsJSON: [],
        loading: true
    });

    React.useEffect(() => {
        let ignore = false;
        if (sessionId) {
            async function fetchData() {
                const response = await utils.webFetch(`presentationList?sessionId=${sessionId}`);
                const data = await response.json();
                if (!ignore) {
                    setState({
                        presentationsJSON: data,
                        loading: false
                    });
                }
            }
            fetchData();
        }
        return () => { ignore = true; }
    }, [sessionId]);

    return (
        <div>
            {state.loading
                ? <p><em>{t('base.loading')}</em></p>
                : <RecursiveTreeView data={state.presentationsJSON} onSelectionChanged={selectionChanged} />}
        </div>
    );
}
