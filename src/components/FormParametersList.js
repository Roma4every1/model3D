import Popover from '@material-ui/core/Popover';
import { ParametersList } from './ParametersList';
import { globalParameters } from './Globals';
import React from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';
var utils = require("../utils")

export default function FormParametersList(props) {
    const { sessionId, formId } = props;
    const [popoverState, setPopoverState] = React.useState({
        anchorEl: null,
        open: false,
        id: undefined
    });
    const [parametersJSON, setParametersJSON] = React.useState([]);

    React.useEffect(() => {
        let ignore = false;

        async function fetchData() {
            const response = await utils.webFetch(`getAllNeedParametersForForm?sessionId=${sessionId}&clientId=${formId}`);
            const responseJSON = await response.json();
            var neededParamsJSON = [];
            globalParameters.globalParameters.forEach(element => {
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
            open: true,
            id: 'simple-popover'
        });
    };

    const handleClose = () => {
        setPopoverState({
            anchorEl: null,
            open: false,
            id: undefined
        });
    };

    return (
        <div>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleClick}>
                <MenuIcon />
            </IconButton>
            <Popover
                id={popoverState.id}
                open={popoverState.open}
                anchorEl={popoverState.anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <ParametersList parametersJSON={parametersJSON} setMainEditedJSON={updateEditedParametersList} />
            </Popover>
        </div>
    );
}
