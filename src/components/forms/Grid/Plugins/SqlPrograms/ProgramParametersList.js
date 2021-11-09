import React from 'react';
import { useSelector } from 'react-redux';
import { DialogActionsBar } from "@progress/kendo-react-dialogs";
import {
    Button
} from "@progress/kendo-react-buttons";
import FormParametersList from '../../../../common/FormParametersList';
import { saveAs } from '@progress/kendo-file-saver';
import { useTranslation } from 'react-i18next';
var utils = require("../../../../../utils");

export default function ProgramParametersList(props) {
    const { t } = useTranslation();
    const { formId, handleClose } = props;
    const sessionManager = useSelector((state) => state.sessionManager);
    const sessionId = useSelector((state) => state.sessionId);

    React.useEffect(() => {
        sessionManager.paramsManager.getCanRunReport(formId);
        return () => { sessionManager.paramsManager.getCanRunReport(null); }
    }, [formId, sessionManager]);

    const canRunReport = useSelector((state) => state.canRunReport);
    const formParams = useSelector((state) => state.formParams[formId]);

    const runReport = React.useCallback(async () => {
        var jsonToSend = { sessionId: sessionId, reportId: formId, paramValues: formParams };
        const jsonToSendString = JSON.stringify(jsonToSend);
        const response = await utils.webFetch(`runReport`,
            {
                method: 'POST',
                body: jsonToSendString
            });
        const resultJson = await response.json();
        if (resultJson.WrongResult) {
            sessionManager.handleWindowData(t('base.error'), t('messages.programError'), 'error');
        }
        if (resultJson.ReportResult) {
            const result = await utils.webFetch(`downloadResource?resourceName=${resultJson.resultPath}&sessionId=${sessionId}`);
            const resultText = await result.text();
            const fileExactName = resultJson.resultPath.split('\\').pop().split('/').pop();
            const path = process.env.PUBLIC_URL + '/' + resultText;
            saveAs(
                path,
                fileExactName);
        }
        sessionManager.channelsManager.updateTables(resultJson.modifiedTables);
    }, [sessionId, formId, formParams, sessionManager]);

    const handleRun = () => {
        handleClose();
        runReport();
    }

    return (
        <div>
            <FormParametersList formId={formId}/>
            <DialogActionsBar>
                <Button className="actionbutton" primary={canRunReport} disabled={!canRunReport} onClick={handleRun}>
                    {t('base.run')}
                </Button>
                <Button className="actionbutton" onClick={handleClose}>
                    {t('base.cancel')}
                </Button>
            </DialogActionsBar>
        </div>
    );
}