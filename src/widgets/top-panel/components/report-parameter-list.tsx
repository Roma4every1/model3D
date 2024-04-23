import { useTranslation } from 'react-i18next';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { ParameterList } from 'entities/parameter';
import { updateReportParameter, runReport } from 'entities/report';


interface ReportParameterListProps {
  id: ClientID;
  report: ReportModel;
  setOpened: (opened: boolean) => void;
  setProcessing: (processing: boolean) => void;
}


/** Редактор параметров процедуры. */
export const ReportParameterList = ({id, report, setOpened, setProcessing}: ReportParameterListProps) => {
  const { t } = useTranslation();
  const close = () => setOpened(false);
  const { channels, parameters, canRun } = report;

  const onParameterChange = (param: Parameter, newValue: any) => {
    updateReportParameter(id, report.id, param.id, newValue).then();
  };
  const run = () => {
    setProcessing(true); setOpened(false);
    runReport(id, report).then(() => setProcessing(false));
  };

  return (
    <Dialog title={t(`report.${report.type}-parameters`)} onClose={close} style={{zIndex: 99}}>
      <ParameterList list={parameters} channels={channels} onChange={onParameterChange}/>
      <DialogActionsBar>
        <Button onClick={run} disabled={!canRun}>{t('base.run')}</Button>
        <Button onClick={close}>{t('base.cancel')}</Button>
      </DialogActionsBar>
    </Dialog>
  );
};
