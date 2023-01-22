import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Button } from "@progress/kendo-react-buttons";
import FormParametersList from "../common/form-parameters-list";
import ProgramParametersButton from "./program-parameters-button";
import { actions, selectors, sessionManager } from "../../store";
import { API } from "../../api/api";


export default function ProgramParametersList(props) {
  const { formId, presentationId, handleClose, handleProcessing, programDisplayName } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const sessionId = useSelector(selectors.sessionID);
  /** @type FormParameter[] */
  const formParams = useSelector(selectors.formParams.bind(formId));

  useEffect(() => {
    sessionManager.paramsManager.getCanRunReport(formId);
    return () => { sessionManager.paramsManager.getCanRunReport(null); }
  }, [formId]);

  const watchOperation = (data) => {
    if (data?.OperationId) {
      const getResult = async () => {
        sessionManager.watchReport(data.OperationId);
        const { data: reportResult } = API.programs.getOperationResult(data.OperationId, 'true');

        if (reportResult?.report?.ModifiedTables?.ModifiedTables) {
          sessionManager.channelsManager.updateTables(reportResult.report.ModifiedTables.ModifiedTables);
        }

        if (reportResult?.reportLog) {
          const text = reportResult.reportLog;
          const fileName = programDisplayName + '.log';
          dispatch(actions.setWindowInfo(text, null, t('report.result'), fileName));
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
  };

  const runReport = async () => {
    handleProcessing(true);
    dispatch(actions.setWindowNotification(t('report.inProgress', {programName: programDisplayName})));
    const jsonToSend = {sessionId, reportId: formId, presentationId, paramValues: formParams};
    const { data } = await API.programs.runReport(JSON.stringify(jsonToSend));

    if (data?.ModifiedTables?.ModifiedTables) {
      sessionManager.channelsManager.updateTables(data.ModifiedTables.ModifiedTables);
    }
    if (data?.ReportResult) {
      const text = data.ReportResult;
      const fileName = programDisplayName + '.log';
      dispatch(actions.setWindowInfo(text, null, t('report.result'), fileName));
    }
    formParams.forEach(param => {
      if (param.editorType === 'fileTextEditor' || param.editorType === 'filesTextEditor') {
          dispatch(actions.updateParam(formId, param.id, null));
      }
    });
    watchOperation(data);
  };

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
