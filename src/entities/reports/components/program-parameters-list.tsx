import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { FormParametersList } from '../../../widgets/root-form/dock/form-parameters-list';
import { ProgramParametersButton } from './program-parameters-button';
import { formParamsSelector, updateParam } from 'entities/parameters';
import { setWindowInfo, setWindowNotification, closeWindowNotification } from 'entities/windows';
import { programsAPI } from '../lib/programs.api';
import { watchReport } from '../lib/common';
import { paramsManager } from '../../../app/store';


export const ProgramParametersList = (props) => {
  const { formId, presentationId, handleClose, handleProcessing, programDisplayName } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const formParams: FormParameter[] = useSelector(formParamsSelector.bind(formId));

  useEffect(() => {
    paramsManager.getCanRunReport(formId);
    return () => { paramsManager.getCanRunReport(null); }
  }, [formId]);

  const watchOperation = (data) => {
    if (data?.OperationId) {
      const getResult = async () => {
        watchReport(data.OperationId, dispatch);
        const { data: reportResult } = await programsAPI.getOperationResult(data.OperationId, 'true');
        if (typeof reportResult === 'string') return;

        // if (reportResult?.report?.ModifiedTables?.ModifiedTables) {
        //   sessionManager.channelsManager.updateTables(reportResult.report.ModifiedTables.ModifiedTables);
        // }

        if (reportResult?.reportLog) {
          const text = reportResult.reportLog;
          const fileName = programDisplayName + '.log';
          dispatch(setWindowInfo(text, null, t('report.result'), fileName));
        }

        if (data?.Pages) {
          paramsManager.updateParamSet(presentationId, data?.Pages.map(p => {
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
        dispatch(closeWindowNotification());
      }, 3000);
    }
  };

  const runReport = async () => {
    handleProcessing(true);
    dispatch(setWindowNotification(t('report.inProgress', {programName: programDisplayName})));
    const { data } = await programsAPI.runReport(formId, presentationId, formParams);
    if (typeof data === 'string') return;

    // if (data?.ModifiedTables?.ModifiedTables) {
    //   sessionManager.channelsManager.updateTables(data.ModifiedTables.ModifiedTables);
    // }
    if (data?.ReportResult) {
      const text = data.ReportResult;
      const fileName = programDisplayName + '.log';
      dispatch(setWindowInfo(text, null, t('report.result'), fileName));
    }
    formParams.forEach(param => {
      if (param.editorType === 'fileTextEditor') {
        dispatch(updateParam(formId, param.id, null));
      }
    });
    watchOperation(data);
  };

  return (
    <Dialog title={t('report.params')} onClose={handleClose} style={{zIndex: 99}}>
      <FormParametersList formID={formId} />
      <DialogActionsBar>
        <ProgramParametersButton programID={formId} onClick={() => { runReport(); handleClose(); }}/>
        <Button className={'actionbutton'} onClick={handleClose}>{t('base.cancel')}</Button>
      </DialogActionsBar>
    </Dialog>
  );
};
