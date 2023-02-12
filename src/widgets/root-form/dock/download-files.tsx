import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { DownloadFileItem } from './download-file-item';
import { reportsSelector, clearReports } from 'entities/reports';
import { activeChildIDSelector } from 'widgets/presentation';
import { rootFormIDSelector } from 'widgets/root-form';
import { programsAPI } from '../../../entities/reports/lib/programs.api';
import reportDeleteIcon from 'assets/images/report_delete.png';



const mapReports = (report: Report, i: number) => {
  return <DownloadFileItem key={i} report={report}/>;
};

export const DownloadFiles = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [filterByPresentation, setFilterByPresentation] = useState(true);

  const rootFormID = useSelector(rootFormIDSelector);
  const reports = useSelector(reportsSelector);
  const activeChildID: FormID = useSelector(activeChildIDSelector.bind(rootFormID));

  const deleteReports = () => {
    const presentationID = filterByPresentation ? activeChildID : null;
    const onClearEnd = () => { dispatch(clearReports(presentationID)); };
    programsAPI.clearReports(presentationID).then(onClearEnd);
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
        ? reports.filter(report => report.ID_PR === activeChildID).map(mapReports)
        : reports.map(mapReports)}
    </>
  );
};
