import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { ParameterList } from 'entities/parameter';
import { updateReportParameter, runReport } from 'entities/report';


interface ReportParameterListProps {
  report: ReportModel;
  setOpened: (opened: boolean) => void;
  setProcessing: (processing: boolean) => void;
}


/** Редактор параметров процедуры. */
export const ReportParameterList = ({report, setOpened, setProcessing}: ReportParameterListProps) => {
  const { t } = useTranslation();
  const { channels, parameters, runnable } = report;

  const onParameterChange = ({id}: Parameter, newValue: any) => {
    updateReportParameter(report, id, newValue).then();
  };
  const run = () => {
    setProcessing(true); setOpened(false);
    runReport(report).then(() => setProcessing(false));
  };
  const close = () => setOpened(false);

  return (
    <Dialog title={t(`report.${report.type}-parameters`)} onClose={close} style={{zIndex: 99}}>
      <ParameterList list={parameters} channels={channels} onChange={onParameterChange}/>
      <DialogActionsBar>
        <Button onClick={run} disabled={!runnable}>{t('base.run')}</Button>
        <Button onClick={close}>{t('base.cancel')}</Button>
      </DialogActionsBar>
    </Dialog>
  );
};
