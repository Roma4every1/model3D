import { ThunkDispatch } from 'redux-thunk';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { ParameterList } from 'entities/parameters';
import { updateReportParameter, runReport } from 'entities/reports';


interface ReportParamListProps {
  id: ClientID;
  report: ReportModel;
  setOpened: (opened: boolean) => void;
  setProcessing: (processing: boolean) => void;
}


/** Редактор параметров процедуры. */
export const ReportParamList = ({id, report, setOpened, setProcessing}: ReportParamListProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<ThunkDispatch<WState, any, any>>();

  const close = () => setOpened(false);
  const { channels, parameters, canRun } = report;

  const onParameterChange = (param: Parameter, newValue: any) => {
    dispatch(updateReportParameter(id, report.id, param.id, newValue)).then();
  };
  const run = () => {
    setProcessing(true); setOpened(false);
    dispatch(runReport(id, report)).then(() => setProcessing(false));
  };

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
