import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button } from "@progress/kendo-react-buttons";
import { selectors } from "../../store";


export default function ProgramParametersButton({formId, runReport, handleClose}) {
  const { t } = useTranslation();
  const sessionManager = useSelector(selectors.sessionManager);

  useEffect(() => {
    sessionManager.paramsManager.getCanRunReport(formId);
    return () => { sessionManager.paramsManager.getCanRunReport(null); }
  }, [formId, sessionManager]);

  const canRunReport = useSelector((state: WState) => state.canRunReport);
  const handleRun = () => { runReport(); handleClose(); }

  return (
    <Button className="actionbutton" disabled={!canRunReport} onClick={handleRun}>
      {t('base.run')}
    </Button>
  );
}
