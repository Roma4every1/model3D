import React from 'react';
import { useSelector } from 'react-redux';
import { Popup } from "@progress/kendo-react-popup";
import ParametersList from '../../common/parameters-list';

export default function LocalFormParametersList(props) {
    const sessionManager = useSelector((state) => state.sessionManager);
    const sessionId = useSelector((state) => state.sessionId);
    const { formId } = props;
    const [popoverState, setPopoverState] = React.useState({
        anchorEl: null,
        open: false
    });
    const [parametersJSON, setParametersJSON] = React.useState([]);

    React.useEffect(() => {
        let ignore = false;

        async function fetchData() {
            const data = await sessionManager.fetchData(`getAllNeedParametersForForm?sessionId=${sessionId}&formId=${formId}`);
            const neededParams = await sessionManager.paramsManager.getParameterValues(data, formId, false);
            if (!ignore) {
                setParametersJSON(neededParams);
            }
        }
        fetchData();
        return () => { ignore = true; }
    }, [sessionId, formId, sessionManager]);

    const handleClick = (event) => {
        setPopoverState({
            anchorEl: event.currentTarget,
            open: !popoverState.open,
        });
    };

    return (
        <div>
            <button className="k-button k-button-clear" onClick={handleClick}>
                <span className="k-icon k-i-menu" />
            </button>
            <Popup
                id={formId.id}
                show={popoverState.open}
                anchor={popoverState.anchorEl}
            >
                <ParametersList parametersJSON={parametersJSON} />
            </Popup>
        </div>
    );
}
