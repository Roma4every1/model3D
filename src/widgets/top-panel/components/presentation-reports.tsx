import { useTranslation } from 'react-i18next';
import { useReports } from 'entities/report';
import { ReportButton } from './report-button';
import './presentation-reports.scss';


/** Список доступных программ/отчётов презентации. */
export const PresentationReports = ({id}: {id: ClientID}) => {
  const reports = useReports(id);
  if (!reports) return <div/>;
  if (reports.length === 0) return <NoReports/>;

  const toButton = (report: ReportModel) => {
    return <ReportButton key={report.orderIndex} report={report}/>;
  };
  return <div className={'presentation-reports'}>{reports.map(toButton)}</div>;
};

const NoReports = () => {
  const { t } = useTranslation();
  return (
    <div className={'presentation-reports-empty'}>
      <span>{t('report.no-reports')}</span>
    </div>
  );
};
