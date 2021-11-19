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
    const { formId, presentationId, handleClose, programDisplayName } = props;
    const sessionManager = useSelector((state) => state.sessionManager);
    const sessionId = useSelector((state) => state.sessionId);

    React.useEffect(() => {
        sessionManager.paramsManager.getCanRunReport(formId);
        return () => { sessionManager.paramsManager.getCanRunReport(null); }
    }, [formId, sessionManager]);

    const canRunReport = useSelector((state) => state.canRunReport);
    const formParams = useSelector((state) => state.formParams[formId]);

    const runReport = React.useCallback(async () => {
        var jsonToSend = { sessionId: sessionId, reportId: formId, presentationId: presentationId, paramValues: formParams };
        const jsonToSendString = JSON.stringify(jsonToSend);
        var data = await sessionManager.fetchData(`runReport`,
            {
                method: 'POST',
                body: jsonToSendString
            });

        if (data && data.ModifiedTables && data.ModifiedTables.ModifiedTables) {
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
        if (data.OperationId) {
            var ids = data.OperationId.split(',');
            Promise.all(ids.map(id => {
                const getResult = async () => {
                    sessionManager.watchReport(id, data);
                    var reportResult = await sessionManager.fetchData(`getOperationResult?sessionId=${sessionId}&operationId=${id}&waitResult=true`);
                    if (reportResult && reportResult.ModifiedTables && reportResult.ModifiedTables.ModifiedTables) {
                        sessionManager.channelsManager.updateTables(reportResult.ModifiedTables.ModifiedTables);
                    }
                    return reportResult;
                }
                if (id) {
                    return getResult();
                }
                else {
                    return null;
                }
            }));
        }
    }, [sessionId, formId, presentationId, formParams, sessionManager, dispatch, programDisplayName, t]);

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