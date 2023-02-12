import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from '@progress/kendo-react-buttons';
import { canRunReportSelector } from '../store/can-run-report/can-run-report.selectors';
import { paramsManager } from '../../../app/store';


interface ProgramParametersButtonProps {
  programID: ProgramID,
  onClick: () => void,
}


export const ProgramParametersButton = ({programID, onClick}: ProgramParametersButtonProps) => {
  const { t } = useTranslation();
  const canRunReport = useSelector(canRunReportSelector);

  useEffect(() => {
    paramsManager.getCanRunReport(programID);
    return () => { paramsManager.getCanRunReport(null); }
  }, [programID]);

  return (
    <Button className={'actionbutton'} disabled={!canRunReport} onClick={onClick}>
      {t('base.run')}
    </Button>
  );
};
