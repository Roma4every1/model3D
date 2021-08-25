import React from 'react';
import { Dialog } from "@progress/kendo-react-dialogs";
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

async function runReport(sessionId, reportGuid, paramValues) {
    const response = await utils.webFetch(`runReport?sessionId=${sessionId}&reportguid=${reportGuid}&paramValues=${paramValues}`);
    const fileName = await response.text();
    const result = await utils.webFetch(`downloadResource?resourceName=${fileName}&sessionId=${sessionId}`);
    const resultText = await result.text();
    const fileExactName = fileName.split('\\').pop().split('/').pop();
    const path = process.env.PUBLIC_URL + '/' + resultText;
    saveAs(
        path,
        fileExactName);
}

async function getCanRunReport(sessionId, reportGuid, paramValues, functionToSetRunButtonDisabled) {
    const response = await utils.webFetch(`canRunReport?sessionId=${sessionId}&reportguid=${reportGuid}&paramValues=${paramValues}`);
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
    const { sessionId, programId, programDisplayName } = props;
    const [open, setOpen] = React.useState(false);
    const [localParametersJSON, setLocalParametersJSON] = React.useState([]);
    const [globalParametersJSON, setGlobalParametersJSON] = React.useState([]);
    const [editedJSON, setEditedJSON] = React.useState([]);
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

    const updateEditedParametersListByLocal = (parametersJSON) => {
        var newJSON = [];
        setLocalParametersJSON(parametersJSON);
        parametersJSON.forEach(element => {
            newJSON.push(element)
        });
        globalParametersJSON.forEach(element => {
            newJSON.push(element)
        });
        setEditedJSON(newJSON);
        getCanRunReport(sessionId, programId, JSON.stringify(newJSON).replaceAll('#', '%23'), setRunButtonDisabled);
    };

    const updateEditedParametersListByGlobal = (parametersJSON) => {
        var newJSON = [];
        setGlobalParametersJSON(parametersJSON);
        localParametersJSON.forEach(element => {
            newJSON.push(element)
        });
        parametersJSON.forEach(element => {
            newJSON.push(element)
        });
        setEditedJSON(newJSON);
        getCanRunReport(sessionId, programId, JSON.stringify(newJSON).replaceAll('#', '%23'), setRunButtonDisabled);
    };

    return (

        <div>
            <Button className="programmbutton" variant="outlined" onClick={() => { fillReportParameters(sessionId, programId, handleOpen, updateLocalParametersList, updateGlobalParametersList) }}>
                {programDisplayName}
            </Button>
            {open && (
                <Dialog title={t('report.params')} onClose={handleClose} initialHeight={350}>
                    <ParametersList parametersJSON={globalParametersJSON} setMainEditedJSON={updateEditedParametersListByGlobal} />
                    <ParametersList parametersJSON={localParametersJSON} setMainEditedJSON={updateEditedParametersListByLocal} />
                    <Button className="actionbutton" primary={!runButtonDisabled} disabled={runButtonDisabled} onClick={() => { handleClose(); runReport(sessionId, programId, JSON.stringify(editedJSON).replaceAll('#', '%23')) }}>
                        {t('base.run')}
                    </Button>
                    <Button className="actionbutton" onClick={handleClose}>
                        {t('base.cancel')}
                    </Button>
                </Dialog>
            )}
        </div>
    );
}