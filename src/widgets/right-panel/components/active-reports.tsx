import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { ActiveReport } from './active-report';
import { reportsSelector, clearReports } from 'entities/reports';
import { reportsAPI } from 'entities/reports/lib/reports.api';
import reportDeleteIcon from 'assets/images/report_delete.png';


export interface ActiveReportsProps {
  activeID: FormID,
}


/** Список активных отчётов, готовых или в процессе. */
export const ActiveReports = ({activeID}: ActiveReportsProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const reports = useSelector(reportsSelector);
  const [filterByPresentation, setFilterByPresentation] = useState(true);

  const deleteReports = () => {
    const presentationID = filterByPresentation ? activeID : null;
    const onClearEnd = () => { dispatch(clearReports(presentationID)); };
    reportsAPI.clearReports(presentationID).then(onClearEnd);
  };

  return (
    <>
      <div className={'reports-header'}>
        <Checkbox
          id={'downloadFiles'} name={'downloadFiles'}
          label={t('downloadFiles.filter')}
          value={filterByPresentation}
          onChange={(e) => {setFilterByPresentation(Boolean(e.target.value))}}
        />
        <Button className={'k-button k-button-clear'} onClick={deleteReports}>
          <img
            src={reportDeleteIcon} alt={t('downloadFiles.clear')}
            title={t('downloadFiles.clear')}
          />
        </Button>
      </div>
      {filterByPresentation
        ? reports.filter(report => report.ID_PR === activeID).map(mapReports)
        : reports.map(mapReports)}
    </>
  );
};

const mapReports = (report: Report, i: number) => {
  return <ActiveReport key={i} report={report}/>;
};
