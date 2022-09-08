import { useState, useCallback } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Loader } from "@progress/kendo-react-indicators";
import ProgramParametersList from "./ProgramParametersList";


interface ProgramButtonProps {
  formID: FormID,
  program: ProgramListItem,
  sessionManager: any,
  sessionID: SessionID,
}


export default function ProgramButton({formID, program, sessionManager, sessionID}: ProgramButtonProps) {
  const [reportProcessing, handleProcessing] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {setOpen(true)};
  const handleClose = () => {setOpen(false)};

  const fillReportParameters = useCallback(async () => {
    await sessionManager.paramsManager.loadFormParameters(formID, true);
    const data = await sessionManager.fetchData(`getAllNeedParametersForForm?sessionId=${sessionID}&formId=${formID}`);
    await sessionManager.paramsManager.getParameterValues(data, formID, true);
    handleOpen();
  }, [sessionManager, sessionID, formID]);

  return (
    <>
      <Button className={'actionbutton'} onClick={fillReportParameters}>
        {program.displayName}
        {reportProcessing && <Loader size={'small'} type={'infinite-spinner'} />}
      </Button>
      {open && <ProgramParametersList
        handleProcessing={handleProcessing}
        formId={formID} presentationId={formID}
        handleClose={handleClose} programDisplayName={program.displayName}
      />}
    </>
  );
}
