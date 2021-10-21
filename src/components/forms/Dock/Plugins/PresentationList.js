import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import setActiveChildren from '../../../../store/actionCreators/setActiveChildren';
import setOpenedChildren from '../../../../store/actionCreators/setOpenedChildren';
import RecursiveTreeView from './RecursiveTreeView';
import { useTranslation } from 'react-i18next';
var utils = require("../../../../utils")

export default function PresentationList(props) {
    const { t } = useTranslation();
    const sessionId = useSelector((state) => state.sessionId);
    const dispatch = useDispatch();
    const { formId } = props;
    const [state, setState] = React.useState({
        formsJSON: [],
        loading: true
    });
    const activeChild = useSelector((state) => state.childForms[formId].activeChildren[0]);

    const selectionChanged = (value) => {
        dispatch(setActiveChildren(formId, [value.item.id]));
        dispatch(setOpenedChildren(formId, [value.item.id]));
    };

    const setActive = React.useCallback((presJSON) => {
        if (presJSON.id === activeChild) {
            presJSON.selected = true;
            return true;
        }
        presJSON?.items?.forEach(item => {
            if (setActive(item)) {
                presJSON.expanded = true;
            }
        });
    }, [activeChild]);

    React.useEffect(() => {
        let ignore = false;
        if (sessionId) {
            async function fetchData() {
                const response = await utils.webFetch(`presentationList?sessionId=${sessionId}&formId=${formId}`);
                const data = await response.json();
                if (!ignore) {
                    setActive(data);
                    setState({
                        formsJSON: data,
                        loading: false
                    });
                }
            }
            fetchData();
        }
        return () => { ignore = true; }
    }, [sessionId, formId, setActive]);

    return (
        <div>
            {state.loading
                ? <p><em>{t('base.loading')}</em></p>
                : <RecursiveTreeView data={state.formsJSON} onSelectionChanged={selectionChanged} />}
        </div>
    );
}
