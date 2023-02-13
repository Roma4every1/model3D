import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ReportButton } from './report-button';
import { rootActiveChildIDSelector, activeChildReportsSelector } from '../../store/root-form.selectors';


/** Список доступных программ/отчётов презентации. */
export const PresentationReports = () => {
  const id = useSelector(rootActiveChildIDSelector);
  const reports = useSelector(activeChildReportsSelector);

  const availableReports = useMemo(() => {
    return reports.filter(report => report.visible);
  }, [reports]);

  const reportToButton = (report: ReportInfo, i: number) => {
    return <ReportButton key={i} id={id} report={report}/>;
  };

  if (availableReports.length === 0) return <NoReports/>;
  return <div className={'program-list'}>{availableReports.map(reportToButton)}</div>;
};

const NoReports = () => {
  const { t } = useTranslation();
  return (
    <div className={'program-list-empty'}>
      <span>{t('report.no-reports')}</span>
    </div>
  );
};
