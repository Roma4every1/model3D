import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { updateTables } from 'entities/channels';
import { ParameterList, formParamsSelector, updateParam } from 'entities/parameters';
import { setWindowInfo, setWindowNotification, closeWindowNotification } from 'entities/windows';
import { reportsAPI } from 'entities/reports/lib/reports.api';
import { watchReport } from 'entities/reports';


interface ProgramParamListProps {
  id: FormID,
  report: ReportInfo,
  setProcessing: (value: boolean) => void,
  close: () => void,
}


/** Редактор параметров SQL-программы или отчёта. */
export const ReportParamList = ({id, report, setProcessing, close}: ProgramParamListProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const programParams: Parameter[] = useSelector(formParamsSelector.bind(report.id));

  const watchOperation = (data) => {
    if (data?.OperationId) {
      const getResult = async () => {
        watchReport(data.OperationId, dispatch);
        const { data: reportResult } = await reportsAPI.getOperationResult(data.OperationId, 'true');
        if (typeof reportResult === 'string') return;

        const modifiedTables = reportResult?.report?.ModifiedTables?.ModifiedTables;
        if (modifiedTables) dispatch(updateTables(modifiedTables));

        if (reportResult?.reportLog) {
          const text = reportResult.reportLog;
          const fileName = report.displayName + '.log';
          dispatch(setWindowInfo(text, null, t('report.result'), fileName));
        }

        watchOperation(reportResult);
        return reportResult;
      }
      return getResult();
    } else {
      setProcessing(false);
      setTimeout(() => {
        dispatch(closeWindowNotification());
      }, 3000);
    }
  };

  const runReport = async () => {
    setProcessing(true);
    dispatch(setWindowNotification(t('report.inProgress', {programName: report.displayName})));
    const { data } = await reportsAPI.runReport(report.id, id, programParams);
    if (typeof data === 'string') return;

    const modifiedTables = data?.ModifiedTables?.ModifiedTables;
    if (modifiedTables) dispatch(updateTables(modifiedTables));

    if (data?.ReportResult) {
      const text = data.ReportResult;
      const fileName = report.displayName + '.log';
      dispatch(setWindowInfo(text, null, t('report.result'), fileName));
    }
    programParams.forEach(param => {
      if (param.editorType === 'fileTextEditor') {
        dispatch(updateParam(report.id, param.id, null));
      }
    });
    watchOperation(data);
  };

  return (
    <Dialog title={t('report.params')} onClose={close} style={{zIndex: 99}}>
      <ParameterList params={programParams ?? []}/>
      <DialogActionsBar>
        <Button onClick={() => { runReport(); close(); }}>
          {t('base.run')}
        </Button>
        <Button onClick={close}>
          {t('base.cancel')}
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
};
