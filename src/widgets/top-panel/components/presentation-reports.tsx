import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ReportButton } from './report-button';
import { reportModelsSelector } from 'entities/reports';
import './presentation-reports.scss';


export interface PresentationReportsProps {
  id: FormID,
}


/** Список доступных программ/отчётов презентации. */
export const PresentationReports = ({id}: PresentationReportsProps) => {
  const reports: ReportModel[] = useSelector(reportModelsSelector.bind(id));

  const availableReports = useMemo(() => {
    if (!reports) return [];
    return reports.filter(report => report.visible);
  }, [reports]);

  const reportToButton = (report: ReportModel, i: number) => {
    return <ReportButton key={i} id={id} report={report}/>;
  };

  if (availableReports.length === 0) return <NoReports/>;
  return <div className={'presentation-reports'}>{availableReports.map(reportToButton)}</div>;
};

const NoReports = () => {
  const { t } = useTranslation();
  return (
    <div className={'presentation-reports-empty'}>
      <span>{t('report.no-reports')}</span>
    </div>
  );
};
