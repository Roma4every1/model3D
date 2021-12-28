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
import updateParam from "../../../../../store/actionCreators/updateParam";
import FormParametersList from '../../../../common/FormParametersList';

export default function ProgramParametersList(props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { formId, presentationId, handleClose, handleProcessing, programDisplayName } = props;
    const sessionManager = useSelector((state) => state.sessionManager);
    const sessionId = useSelector((state) => state.sessionId);

    React.useEffect(() => {
        sessionManager.paramsManager.getCanRunReport(formId);
        return () => { sessionManager.paramsManager.getCanRunReport(null); }
    }, [formId, sessionManager]);

    const canRunReport = useSelector((state) => state.canRunReport);
    const formParams = useSelector((state) => state.formParams[formId]);

    const watchOperation = React.useCallback((data) => {
        if (data.OperationId) {
            const getResult = async () => {
                sessionManager.watchReport(data.OperationId);
                var reportResult = await sessionManager.fetchData(`getOperationResult?sessionId=${sessionId}&operationId=${data.OperationId}&waitResult=true`);
                if (reportResult?.report?.ModifiedTables?.ModifiedTables) {
                    sessionManager.channelsManager.updateTables(reportResult.report.ModifiedTables.ModifiedTables);
                }
                if (reportResult?.reportLog) {
                    sessionManager.handleWindowInfo(<div>{reportResult.reportLog}</div>, null, t("report.result"), programDisplayName + ".log");
                }
                watchOperation(reportResult);
                return reportResult;
            }
            return getResult();
        }
        else {
            handleProcessing(false);
        }
    }, [programDisplayName, sessionId, sessionManager, handleProcessing, t]);

    const runReport = React.useCallback(async () => {
        handleProcessing(true);
        var jsonToSend = { sessionId: sessionId, reportId: formId, presentationId: presentationId, paramValues: formParams };
        const jsonToSendString = JSON.stringify(jsonToSend);
        var data = await sessionManager.fetchData(`runReport`,
            {
                method: 'POST',
                body: jsonToSendString
            });

        if (data?.ModifiedTables?.ModifiedTables) {
            sessionManager.channelsManager.updateTables(data.ModifiedTables.ModifiedTables);
        }
        if (data.ReportResult) {
            sessionManager.handleWindowInfo(data.ReportResult, null, t("report.result"), programDisplayName + ".log");
        }
        formParams.forEach(param => {
            if (param.editorType === "fileTextEditor" ||
                param.editorType === "filesTextEditor") {
                dispatch(updateParam(formId, param.id, null, true));
            }
        });
        watchOperation(data);
    }, [watchOperation, sessionId, formId, presentationId, formParams, sessionManager, dispatch, programDisplayName, handleProcessing, t]);

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