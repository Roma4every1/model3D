import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { ActiveOperationStatus } from './active-operation-status';
import { useOperations, clearOperations } from 'entities/report';
import { reportAPI } from 'entities/report/lib/report.api';
import reportDeleteIcon from 'assets/reports/report-delete.png';
import './active-operations.scss';


/** Список активных отчётов, готовых или в процессе. */
export const ActiveOperations = ({activeID}: {activeID: ClientID}) => {
  const { t } = useTranslation();
  const operations = useOperations();
  const [filterByPresentation, setFilterByPresentation] = useState(true);

  const deleteReports = () => {
    const presentationID = filterByPresentation ? activeID : null;
    const onClearEnd = () => clearOperations(presentationID);
    reportAPI.clearReports(presentationID).then(onClearEnd);
  };

  return (
    <>
      <div className={'active-operations-header'}>
        <Checkbox
          id={'downloadFiles'} name={'downloadFiles'}
          label={t('report.filter-operations')}
          value={filterByPresentation}
          onChange={(e) => {setFilterByPresentation(e.value)}}
        />
        <Button className={'k-button k-button-clear'} onClick={deleteReports}>
          <img
            src={reportDeleteIcon} alt={t('report.clear-operations')}
            title={t('report.clear-operations')}
          />
        </Button>
      </div>
      {filterByPresentation
        ? operations.filter(o => o.clientID === activeID).map(mapReports)
        : operations.map(mapReports)}
    </>
  );
};

function mapReports(status: OperationStatus, i: number) {
  return <ActiveOperationStatus key={i} status={status}/>;
}
