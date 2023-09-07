import { useDispatch } from 'shared/lib';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { ParameterList } from 'entities/parameters';
import { updateReportParameter, runReport } from 'entities/reports';


interface ReportParamListProps {
  id: ClientID;
  report: ReportModel;
  close: () => void;
}


/** Редактор параметров процедуры. */
export const ReportParamList = ({id, report, close}: ReportParamListProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const onParameterChange = (param: Parameter, newValue: any) => {
    dispatch(updateReportParameter(id, report.id, param.id, newValue));
  };
  const run = () => {
    dispatch(runReport(id, report)); close();
  };
  const { channels, parameters, canRun } = report;

  return (
    <Dialog title={t(`report.${report.type}-parameters`)} onClose={close} style={{zIndex: 99}}>
      <ParameterList params={parameters} channels={channels} onChange={onParameterChange}/>
      <DialogActionsBar>
        <Button onClick={run} disabled={!canRun}>{t('base.run')}</Button>
        <Button onClick={close}>{t('base.cancel')}</Button>
      </DialogActionsBar>
    </Dialog>
  );
};
