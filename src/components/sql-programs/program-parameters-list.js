import React, { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Button } from "@progress/kendo-react-buttons";
import FormParametersList from "../common/form-parameters-list";
import ProgramParametersButton from "./program-parameters-button";
import { actions, selectors } from "../../store";


export default function ProgramParametersList(props) {
  const { formId, presentationId, handleClose, handleProcessing, programDisplayName } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const sessionManager = useSelector(selectors.sessionManager);
  const sessionId = useSelector(selectors.sessionID);
  /** @type FormParameter[] */
  const formParams = useSelector(selectors.formParams.bind(formId));

  useEffect(() => {
    sessionManager.paramsManager.getCanRunReport(formId);
    return () => { sessionManager.paramsManager.getCanRunReport(null); }
  }, [formId, sessionManager]);

  const watchOperation = useCallback((data) => {
    if (data?.OperationId) {
      const getResult = async () => {
        sessionManager.watchReport(data.OperationId);
        const path = `getOperationResult?sessionId=${sessionId}&operationId=${data.OperationId}&waitResult=true`;
        const reportResult = await sessionManager.fetchData(path);

        if (reportResult?.report?.ModifiedTables?.ModifiedTables) {
          sessionManager.channelsManager.updateTables(reportResult.report.ModifiedTables.ModifiedTables);
        }

        if (reportResult?.reportLog) {
          sessionManager.handleWindowInfo(reportResult.reportLog, null, t('report.result'), programDisplayName + ".log");
        }

        if (data?.Pages) {
          sessionManager.paramsManager.updateParamSet(presentationId, data?.Pages.map(p => {
            var keyValue = p.split('|');
            return {id: keyValue[0], value: keyValue[1]};
          }));
        }

        watchOperation(reportResult);
        return reportResult;
      }
      return getResult();
    } else {
      handleProcessing(false);
      setTimeout(() => {
        dispatch(actions.closeWindowNotification());
      }, 3000);
    }
  }, [programDisplayName, presentationId, sessionId, sessionManager, handleProcessing, t, dispatch]);

  const runReport = useCallback(async () => {
    handleProcessing(true);
    sessionManager.handleNotification(t('report.inProgress', {programName: programDisplayName}))
    const jsonToSend = {sessionId, reportId: formId, presentationId, paramValues: formParams};
    const data = await sessionManager.fetchData(
      'runReport',
      {method: 'POST', body: JSON.stringify(jsonToSend)}
    );

    if (data?.ModifiedTables?.ModifiedTables) {
      sessionManager.channelsManager.updateTables(data.ModifiedTables.ModifiedTables);
    }
    if (data?.ReportResult) {
      sessionManager.handleWindowInfo(data.ReportResult, null, t('report.result'), programDisplayName + ".log");
    }
    formParams.forEach(param => {
      if (param.editorType === 'fileTextEditor' || param.editorType === 'filesTextEditor') {
          dispatch(actions.updateParam(formId, param.id, null, true));
      }
    });
    watchOperation(data);
  }, [watchOperation, sessionId, formId, presentationId, formParams, sessionManager, dispatch, programDisplayName, handleProcessing, t]);

  return (
    <Dialog title={t('report.params')} onClose={handleClose} initialHeight={350} style={{zIndex: 99}}>
      <FormParametersList formId={formId} />
      <DialogActionsBar>
        <ProgramParametersButton formId={formId} runReport={runReport} handleClose={handleClose} />
        <Button className={'actionbutton'} onClick={handleClose}>{t('base.cancel')}</Button>
      </DialogActionsBar>
    </Dialog>
  );
}
