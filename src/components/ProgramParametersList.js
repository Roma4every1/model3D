import React from 'react';
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import {
    Button
} from "@progress/kendo-react-buttons";
import { ParametersList } from './ParametersList';
import { globals } from './Globals';
import { saveAs } from '@progress/kendo-file-saver';
import { useTranslation } from 'react-i18next';
var utils = require("../utils")

async function fillReportParameters(sessionId, reportGuid, handleOpen, updateLocalParametersList, updateGlobalParametersList) {
    const response = await utils.webFetch(`getProgramParameters?sessionId=${sessionId}&reportguid=${reportGuid}`);
    const allNeededParams = await utils.webFetch(`getAllNeedParametersList?sessionId=${sessionId}&reportguid=${reportGuid}`);
    const parametersJSON = await response.json();
    const allNeededParamsJSON = await allNeededParams.json();
    var globalParamsToUse = [];
    allNeededParamsJSON.forEach(element => {
        globals.globalParameters.forEach(globalParam => {
            if (globalParam.id === element) {
                globalParamsToUse.push(globalParam);
            }
        });
    });
    updateGlobalParametersList(globalParamsToUse);
    updateLocalParametersList(parametersJSON);
    handleOpen();
}

async function runReport(sessionId, reportGuid, paramValues, tablesModified) {
    var jsonToSend = { sessionId: sessionId, reportId: reportGuid, paramValues: paramValues };
    const jsonToSendString = JSON.stringify(jsonToSend);
    const response = await utils.webFetch(`runReport`,
        {
            method: 'POST',
            body: jsonToSendString
        });
    const resultJson = await response.json();
    if (resultJson.resultPath) {
        const result = await utils.webFetch(`downloadResource?resourceName=${resultJson.resultPath}&sessionId=${sessionId}`);
        const resultText = await result.text();
        const fileExactName = resultJson.resultPath.split('\\').pop().split('/').pop();
        const path = process.env.PUBLIC_URL + '/' + resultText;
        saveAs(
            path,
            fileExactName);
    }
    if (resultJson.modifiedTables) {
        tablesModified(resultJson.modifiedTables);
    }
}

async function getCanRunReport(sessionId, reportGuid, paramValues, functionToSetRunButtonDisabled) {
    var jsonToSend = { sessionId: sessionId, reportId: reportGuid, paramValues: paramValues };
    const jsonToSendString = JSON.stringify(jsonToSend);
    const response = await utils.webFetch(`canRunReport`,
        {
            method: 'POST',
            body: jsonToSendString
        });
    const responsetext = await response.text();
    if (responsetext === 'True') {
        functionToSetRunButtonDisabled(false);
    }
    else {
        functionToSetRunButtonDisabled(true);
    }
}

export default function ProgramParametersList(props) {
    const { t } = useTranslation();
    const { sessionId, programId, programDisplayName, tablesModified } = props;
    const [open, setOpen] = React.useState(false);
    const [localParametersJSON, setLocalParametersJSON] = React.useState([]);
    const [globalParametersJSON, setGlobalParametersJSON] = React.useState([]);
    const [programEditedJSON, updateEditedJSON] = React.useReducer(editedJSONReducer, []);
    const [runButtonDisabled, setRunButtonDisabled] = React.useState(true);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const updateLocalParametersList = (parametersJSON) => {
        setLocalParametersJSON(parametersJSON);
    };

    const updateGlobalParametersList = (parametersJSON) => {
        setGlobalParametersJSON(parametersJSON);
    };

    function editedJSONReducer(state, action) {
        var newJSON = [];
        if (action.globalParametersJSON) {
            localParametersJSON.forEach(element => {
                newJSON.push(element)
            });
            action.globalParametersJSON.forEach(element => {
                newJSON.push(element)
            });
        }
        else if (action.localParametersJSON) {
            action.localParametersJSON.forEach(element => {
                newJSON.push(element)
            });
            globalParametersJSON.forEach(element => {
                newJSON.push(element)
            });
        }
        else {
            return state;
        }
        return newJSON;
    }

    const updateEditedParametersListByLocal = (parametersJSON) => {
        setLocalParametersJSON(parametersJSON);
        updateEditedJSON({ localParametersJSON: parametersJSON });
    };

    const updateEditedParametersListByGlobal = (parametersJSON) => {
        setGlobalParametersJSON(parametersJSON);
        updateEditedJSON({ globalParametersJSON: parametersJSON });
    };

    React.useEffect(() => {
        getCanRunReport(sessionId, programId, programEditedJSON, setRunButtonDisabled);
    }, [sessionId, programId, programEditedJSON]);

    const handleRun = () => {
        handleClose();
        runReport(sessionId, programId, programEditedJSON, tablesModified);
    }

    return (

        <div>
            <Button className="programmbutton" onClick={() => { fillReportParameters(sessionId, programId, handleOpen, updateLocalParametersList, updateGlobalParametersList) }}>
                {programDisplayName}
            </Button>
            {open && (
                <Dialog title={t('report.params')} onClose={handleClose} initialHeight={350}>
                    <ParametersList parametersJSON={globalParametersJSON} setMainEditedJSON={updateEditedParametersListByGlobal} />
                    <ParametersList parametersJSON={localParametersJSON} setMainEditedJSON={updateEditedParametersListByLocal} programId={programId} />
                    <DialogActionsBar>
                        <Button className="actionbutton" primary={!runButtonDisabled} disabled={runButtonDisabled} onClick={handleRun}>
                            {t('base.run')}
                        </Button>
                        <Button className="actionbutton" onClick={handleClose}>
                            {t('base.cancel')}
                        </Button>
                    </DialogActionsBar>
                </Dialog>
            )}
        </div>
    );
}