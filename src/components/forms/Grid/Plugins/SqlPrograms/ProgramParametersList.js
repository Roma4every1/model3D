import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogActionsBar
} from "@progress/kendo-react-dialogs";
import {
    Button
} from "@progress/kendo-react-buttons";
import { saveAs } from '@progress/kendo-file-saver';
import updateParam from "../../../../../store/actionCreators/updateParam";
import FormParametersList from '../../../../common/FormParametersList';

export default function ProgramParametersList(props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
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
        var data = await sessionManager.fetchData(`runReport`,
            {
                method: 'POST',
                body: jsonToSendString
            });
        if (data.OperationId) {
            sessionManager.watchReport(data.OperationId, data);
            data = await sessionManager.fetchData(`getOperationResult?sessionId=${sessionId}&operationId=${data.OperationId}&waitResult=true`);
        }
        if (data.WrongResult) {
            sessionManager.handleWindowError(t('messages.programError'));
        }
        if (data.Path) {
            const resultText = await sessionManager.fetchData(`downloadResource?resourceName=${data.Path}&sessionId=${sessionId}`);
            const fileExactName = data.Path.split('\\').pop().split('/').pop();
            const path = process.env.PUBLIC_URL + '/' + resultText;
            saveAs(
                path,
                fileExactName);
        }
        if (data && data.ModifiedTables && data.ModifiedTables.ModifiedTables) {
            sessionManager.channelsManager.updateTables(data.ModifiedTables.ModifiedTables);
        }
        formParams.forEach(param => {
            if (param.editorType === "fileTextEditor" ||
                param.editorType === "filesTextEditor" )
                {
                    dispatch(updateParam(formId, param.id, null, true));
                }
        });
    }, [sessionId, formId, formParams, sessionManager, t, dispatch]);

    const handleRun = () => {
        handleClose();
        runReport();
    }

    return (
        <Dialog title={t('report.params')} onClose={handleClose} initialHeight={350}>
            <FormParametersList formId={formId} />
            <DialogActionsBar>
                <Button className="actionbutton" primary={canRunReport} disabled={!canRunReport} onClick={handleRun}>
                    {t('base.run')}
                </Button>
                <Button className="actionbutton" onClick={handleClose}>
                    {t('base.cancel')}
                </Button>
            </DialogActionsBar>
        </Dialog>
    );
}