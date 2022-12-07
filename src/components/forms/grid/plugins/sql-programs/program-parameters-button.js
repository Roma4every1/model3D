import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button } from "@progress/kendo-react-buttons";


export default function ProgramParametersButton(props) {
  const { t } = useTranslation();
  const { formId, runReport, handleClose } = props;
  const sessionManager = useSelector((state) => state.sessionManager);

  React.useEffect(() => {
    sessionManager.paramsManager.getCanRunReport(formId);
    return () => { sessionManager.paramsManager.getCanRunReport(null); }
  }, [formId, sessionManager]);

  const canRunReport = useSelector((state) => state.canRunReport ? 'true' : 'false');

  const handleRun = () => {
    handleClose();
    runReport();
  }

  return (
    <Button className="actionbutton" primary={canRunReport} disabled={!canRunReport} onClick={handleRun}>
      {t('base.run')}
    </Button>
  );
}
