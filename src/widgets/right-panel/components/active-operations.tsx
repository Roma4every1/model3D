import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { ActiveOperationStatus } from './active-operation-status';
import { operationsSelector, clearReports } from 'entities/reports';
import { reportsAPI } from 'entities/reports/lib/reports.api';
import reportDeleteIcon from 'assets/images/reports/report_delete.png';
import './active-operations.scss';


export interface ActiveReportsProps {
  activeID: FormID,
}


/** Список активных отчётов, готовых или в процессе. */
export const ActiveOperations = ({activeID}: ActiveReportsProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const operations = useSelector(operationsSelector);
  const [filterByPresentation, setFilterByPresentation] = useState(true);

  const deleteReports = () => {
    const presentationID = filterByPresentation ? activeID : null;
    const onClearEnd = () => { dispatch(clearReports(presentationID)); };
    reportsAPI.clearReports(presentationID).then(onClearEnd);
  };

  return (
    <>
      <div className={'active-operations-header'}>
        <Checkbox
          id={'downloadFiles'} name={'downloadFiles'}
          label={t('downloadFiles.filter')}
          value={filterByPresentation}
          onChange={(e) => {setFilterByPresentation(e.value)}}
        />
        <Button className={'k-button k-button-clear'} onClick={deleteReports}>
          <img
            src={reportDeleteIcon} alt={t('downloadFiles.clear')}
            title={t('downloadFiles.clear')}
          />
        </Button>
      </div>
      {filterByPresentation
        ? operations.filter(o => o.clientID === activeID).map(mapReports)
        : operations.map(mapReports)}
    </>
  );
};

const mapReports = (status: OperationStatus, i: number) => {
  return <ActiveOperationStatus key={i} status={status}/>;
};
