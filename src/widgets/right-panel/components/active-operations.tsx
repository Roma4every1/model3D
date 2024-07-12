import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { ActiveOperationStatus } from './active-operation-status';
import { useOperations, clearOperations, programAPI } from 'entities/program';
import clearOperationsIcon from 'assets/common/clear-operations.png';
import './active-operations.scss';


/** Список активных отчётов, готовых или в процессе. */
export const ActiveOperations = ({activeID}: {activeID: ClientID}) => {
  const { t } = useTranslation();
  const operations = useOperations();
  const [filterByPresentation, setFilterByPresentation] = useState(true);

  const deleteReports = () => {
    const presentationID = filterByPresentation ? activeID : null;
    const onClearEnd = () => clearOperations(presentationID);
    programAPI.clearPrograms(presentationID).then(onClearEnd);
  };

  return (
    <>
      <div className={'active-operations-header'}>
        <Checkbox
          id={'downloadFiles'} name={'downloadFiles'}
          label={t('operation.filter')}
          value={filterByPresentation}
          onChange={(e) => {setFilterByPresentation(e.value)}}
        />
        <Button className={'k-button k-button-clear'} onClick={deleteReports}>
          <img
            src={clearOperationsIcon} alt={'clear'}
            title={t('operation.clear')}
          />
        </Button>
      </div>
      {filterByPresentation
        ? operations.filter(o => o.clientID === activeID).map(toElement)
        : operations.map(toElement)}
    </>
  );
};

function toElement(status: OperationStatus, i: number) {
  return <ActiveOperationStatus key={i} status={status}/>;
}
