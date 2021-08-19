import { Popup } from "@progress/kendo-react-popup";
import { ParametersList } from './ParametersList';
import { globals } from './Globals';
import React from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';
var utils = require("../utils")

export default function FormParametersList(props) {
    const { sessionId, formId, ...other } = props;
    const [popoverState, setPopoverState] = React.useState({
        anchorEl: null,
        open: false
    });
    const [parametersJSON, setParametersJSON] = React.useState([]);

    React.useEffect(() => {
        let ignore = false;

        async function fetchData() {
            const response = await utils.webFetch(`getAllNeedParametersForForm?sessionId=${sessionId}&clientId=${formId}`);
            const responseJSON = await response.json();
            var neededParamsJSON = [];
            globals.globalParameters.forEach(element => {
                responseJSON.forEach(responseParam => {
                    if (element.id === responseParam) {
                        neededParamsJSON.push(element);
                    }
                });
            });
            if (!ignore) {
                setParametersJSON(neededParamsJSON);
            }
        }
        fetchData();
        return () => { ignore = true; }
    }, [sessionId, formId]);

    const updateEditedParametersList = (newparametersJSON) => {
        setParametersJSON(newparametersJSON);
    };

    const handleClick = (event) => {
        setPopoverState({
            anchorEl: event.currentTarget,
            open: !popoverState.open,
        });
    };

    return (
        <div>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleClick}>
                <MenuIcon />
            </IconButton>
            <Popup
                id={popoverState.id}
                show={popoverState.open}
                anchor={popoverState.anchorEl}
            >
                <ParametersList parametersJSON={parametersJSON} setMainEditedJSON={updateEditedParametersList} {...other} />
            </Popup>
        </div>
    );
}
