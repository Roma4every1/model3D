import React from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import { ParametersList } from './ParametersList';
import FileSaver from 'file-saver';
var utils = require("../utils")

async function fillReportParameters(sessionId, reportGuid, handleOpen, updateParametersList) {
    const response = await utils.webFetch(`getProgramParameters?sessionId=${sessionId}&reportguid=${reportGuid}`);
    const parametersJSON = await response.json();
    if (parametersJSON.length > 0) {
        updateParametersList(parametersJSON);
        handleOpen();
    }
    else {
        await runReport(sessionId, reportGuid, '')
    }
}

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

export function ProgramParametersList(props) {
    const { sessionId, programId, programDisplayName } = props;
    const [open, setOpen] = React.useState(false);
    const [parametersJSON, setParametersJSON] = React.useState('');

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const updateParametersList = (parametersJSON) => {
        setParametersJSON(parametersJSON);
    };

    return (
        <div>
            <Button variant="outlined" onClick={() => { fillReportParameters(sessionId, programId, handleOpen, updateParametersList) }}>
                {programDisplayName}
            </Button>
            <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
                <DialogTitle id="simple-dialog-title">Параметры отчёта</DialogTitle>
                <ParametersList parametersJSON={parametersJSON} />
                <Button variant="outlined" onClick={() => { runReport(sessionId, programId, parametersJSON) }}>
                    Запустить
                </Button>
                <Button variant="outlined" onClick={handleClose}>
                    Отменить
                </Button>
            </Dialog>
        </div>
    );
}