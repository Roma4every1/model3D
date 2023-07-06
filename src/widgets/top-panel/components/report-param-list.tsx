import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { ParameterList } from 'entities/parameters';
import { updateTables } from 'entities/channels';
import { showNotification } from 'entities/notifications';
import { setWindowInfo, setWindowWarning } from 'entities/windows';
import { reportsAPI } from 'entities/reports/lib/reports.api';
import { watchReport, updateReportParam, updateReportParameter } from 'entities/reports';


interface ReportParamListProps {
  id: FormID,
  report: ReportModel,
  close: () => void,
}


/** Редактор параметров SQL-программы или отчёта. */
export const ReportParamList = ({id, report, close}: ReportParamListProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { channels, parameters, canRun } = report;

  const runReport = async () => {
    const { data } = await reportsAPI.runReport(report.id, id, parameters);
    if (typeof data === 'string') { dispatch(setWindowWarning(data)); return; }

    const modifiedTables = data?.ModifiedTables?.ModifiedTables;
    if (modifiedTables) dispatch(updateTables(modifiedTables));

    if (data?.ReportResult) {
      const text = data.ReportResult;
      const fileName = report.displayName + '.log';
      dispatch(setWindowInfo(text, null, t('report.result'), fileName));
    }
    parameters.forEach(param => {
      if (param.editorType === 'fileTextEditor') {
        dispatch(updateReportParam(id, report.id, param.id, null));
      }
    });
    if (data.OperationId) {
      dispatch(showNotification(t('report.inProgress', {programName: report.displayName})));
      await watchReport(report, data.OperationId, dispatch);
    }
  };

  const onParamChange = (param: Parameter, newValue: any) => {
    dispatch(updateReportParameter(id, report.id, param.id, newValue));
  };

  return (
    <Dialog title={t('report.params')} onClose={close} style={{zIndex: 99}}>
      <ParameterList params={parameters} channels={channels} onChange={onParamChange}/>
      <DialogActionsBar>
        <Button onClick={() => { runReport(); close(); }} disabled={!canRun}>
          {t('base.run')}
        </Button>
        <Button onClick={close}>
          {t('base.cancel')}
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
};
