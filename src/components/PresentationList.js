import React from 'react';
import { useSelector } from 'react-redux';
import RecursiveTreeView from './RecursiveTreeView';
import { useTranslation } from 'react-i18next';
var utils = require("../utils")

export default function PresentationList(props) {
    const { t } = useTranslation();
    const sessionId = useSelector((state) => state.sessionId);
    const { setActiveChildById } = props;
    const [state, setState] = React.useState({
        formsJSON: [],
        loading: true
    });

    const selectionChanged = (value) => {
        setActiveChildById(',' + value.item.id)
    };

    React.useEffect(() => {
        let ignore = false;
        if (sessionId) {
            async function fetchData() {
                const response = await utils.webFetch(`presentationList?sessionId=${sessionId}`);
                const data = await response.json();
                if (!ignore) {
                    setState({
                        formsJSON: data,
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
                : <RecursiveTreeView data={state.formsJSON} onSelectionChanged={selectionChanged} />}
        </div>
    );
}
