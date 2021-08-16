import React from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { ParametersList } from './ParametersList';
import RunButton from './buttons/RunButton';
import { globalParameters } from './Globals';
import Divider from '@material-ui/core/Divider';
import FileSaver from 'file-saver';
import { useTranslation } from 'react-i18next';
var utils = require("../utils")

async function fillReportParameters(sessionId, reportGuid, handleOpen, updateLocalParametersList, updateGlobalParametersList) {
    const response = await utils.webFetch(`getProgramParameters?sessionId=${sessionId}&reportguid=${reportGuid}`);
    const allNeededParams = await utils.webFetch(`getAllNeedParametersList?sessionId=${sessionId}&reportguid=${reportGuid}`);
    const parametersJSON = await response.json();
    const allNeededParamsJSON = await allNeededParams.json();
    var globalParamsToUse = [];
    allNeededParamsJSON.forEach(element => {
        globalParameters.globalParameters.forEach(globalParam => {
            if (globalParam.id === element) {
                globalParamsToUse.push(globalParam);
            }
        });
    });
    updateGlobalParametersList(globalParamsToUse);
    updateLocalParametersList(parametersJSON);
    handleOpen();
}

const useStyles = makeStyles({
    label: {
        textTransform: 'none',
    },
});

async function runReport(sessionId, reportGuid, paramValues) {
    const response = await utils.webFetch(`runReport?sessionId=${sessionId}&reportguid=${reportGuid}&paramValues=${paramValues}`);
    const fileName = await response.text();
    const result = await utils.webFetch(`downloadResource?resourceName=${fileName}&sessionId=${sessionId}`);
    const resultText = await result.text();
    const fileExactName = fileName.split('\\').pop().split('/').pop();
    FileSaver.saveAs(
        process.env.PUBLIC_URL + '/' + resultText,
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
    const classes = useStyles();
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
        getCanRunReport(sessionId, programId, JSON.stringify(newJSON), setRunButtonDisabled);
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
        getCanRunReport(sessionId, programId, JSON.stringify(newJSON), setRunButtonDisabled);
    };

    return (

        <div>
            <Button classes={{ label: classes.label }} variant="outlined" onClick={() => { fillReportParameters(sessionId, programId, handleOpen, updateLocalParametersList, updateGlobalParametersList) }}>
                {programDisplayName}
            </Button>
            <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
                <DialogTitle id="simple-dialog-title">{t('report.params')}</DialogTitle>
                <ParametersList parametersJSON={globalParametersJSON} setMainEditedJSON={updateEditedParametersListByGlobal} />
                <Divider />
                <ParametersList parametersJSON={localParametersJSON} setMainEditedJSON={updateEditedParametersListByLocal} />
                <RunButton disabled={runButtonDisabled} runReport={() => { runReport(sessionId, programId, JSON.stringify(editedJSON)) } }/>
                <Button classes={{ label: classes.label }} variant="outlined" onClick={handleClose}>
                    {t('base.cancel')}
                </Button>
            </Dialog>
        </div>
    );
}