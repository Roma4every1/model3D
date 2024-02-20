import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ReportButton } from './report-button';
import { reportModelsSelector } from 'entities/reports';
import './presentation-reports.scss';


export interface PresentationReportsProps {
  id: ClientID;
}


/** Список доступных программ/отчётов презентации. */
export const PresentationReports = ({id}: PresentationReportsProps) => {
  const reports: ReportModel[] = useSelector(reportModelsSelector.bind(id));
  if (!reports) return <div/>;
  if (reports.length === 0) return <NoReports/>;

  const reportToButton = (report: ReportModel, i: number) => {
    return <ReportButton key={i} id={id} report={report}/>;
  };
  return <div className={'presentation-reports'}>{reports.map(reportToButton)}</div>;
};

const NoReports = () => {
  const { t } = useTranslation();
  return (
    <div className={'presentation-reports-empty'}>
      <span>{t('report.no-reports')}</span>
    </div>
  );
};
