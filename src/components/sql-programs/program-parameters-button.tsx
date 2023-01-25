import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from '@progress/kendo-react-buttons';
import { sessionManager } from '../../store';


interface ProgramParametersButtonProps {
  formID: FormID,
  onClick: () => void,
}


const selector = (state: WState) => state.canRunReport;

export const ProgramParametersButton = ({formID, onClick}: ProgramParametersButtonProps) => {
  const { t } = useTranslation();
  const canRunReport = useSelector(selector);

  useEffect(() => {
    sessionManager.paramsManager.getCanRunReport(formID);
    return () => { sessionManager.paramsManager.getCanRunReport(null); }
  }, [formID]);

  return (
    <Button className={'actionbutton'} disabled={!canRunReport} onClick={onClick}>
      {t('base.run')}
    </Button>
  );
};
