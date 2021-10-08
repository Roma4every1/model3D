import React from 'react';
import { useSelector } from 'react-redux';
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import {
    Button
} from "@progress/kendo-react-buttons";
import { ParametersList } from './ParametersList';
import { saveAs } from '@progress/kendo-file-saver';
import { useTranslation } from 'react-i18next';
var utils = require("../utils");

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
    const sessionManager = useSelector((state) => state.sessionManager);

    const { t } = useTranslation();
    const { sessionId, programDisplayName, tablesModified, formId } = props;
    const [open, setOpen] = React.useState(false);
    const [parametersJSON, updateParametersJSON] = React.useReducer(parametersJSONReducer, []);
    const [runButtonDisabled, setRunButtonDisabled] = React.useState(true);

    const fillReportParameters = async (sessionId, formId, handleOpen, updateParametersList) => {
        await sessionManager.paramsManager.loadFormParameters(formId);
        const allNeededParams = await utils.webFetch(`getAllNeedParametersList?sessionId=${sessionId}&reportguid=${formId}`);
        const allNeededParamsJSON = await allNeededParams.json();
        const neededParams = await sessionManager.paramsManager.getParameterValues(allNeededParamsJSON, formId);
        updateParametersList(neededParams);
        handleOpen();
    }


    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const updateParametersList = (parametersJSON) => {
        updateParametersJSON({ parametersJSON: parametersJSON });
    };

    function parametersJSONReducer(state, action) {
        var newJSON = [];
        if (action.updatedParam) {
            state.forEach(element => {
                if (element.id === action.updatedParam.id) {
                    newJSON.push(action.updatedParam)
                }
                else {
                    newJSON.push(element)
                }
            });
        }
        else if (action.parametersJSON) {
            return action.parametersJSON;
        }
        else {
            return state;
        }
        return newJSON;
    }

    const parameterChanged = React.useCallback((updatedParam) => {
        updateParametersJSON({ updatedParam: updatedParam });
    }, [updateParametersJSON]);
    
    React.useEffect(() => {
        getCanRunReport(sessionId, formId, parametersJSON, setRunButtonDisabled);
    }, [sessionId, formId, parametersJSON]);

    const handleRun = () => {
        handleClose();
        runReport(sessionId, formId, parametersJSON, tablesModified);
    }

    return (
        <div>
            <Button className="programmbutton" onClick={() => { fillReportParameters(sessionId, formId, handleOpen, updateParametersList) }}>
                {programDisplayName}
            </Button>
            {open && (
                <Dialog title={t('report.params')} onClose={handleClose} initialHeight={350}>
                    <ParametersList parametersJSON={parametersJSON} selectionChanged={parameterChanged} />
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