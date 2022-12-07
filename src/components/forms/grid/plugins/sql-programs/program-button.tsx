import { useState, useCallback } from "react";
import { Loader } from "@progress/kendo-react-indicators";
import ProgramParametersList from "./program-parameters-list";
import { menuIconsDict } from "../../../../../dicts/images";


interface ProgramButtonProps {
  formID: FormID,
  program: ProgramListItem,
  sessionManager: any,
  sessionID: SessionID,
}


export default function ProgramButton({formID, program, sessionManager, sessionID}: ProgramButtonProps) {
  const [reportProcessing, handleProcessing] = useState(false);
  const [open, setOpen] = useState(false);

  const fillReportParameters = useCallback(async () => {
    await sessionManager.paramsManager.loadFormParameters(formID, true);
    const data = await sessionManager.fetchData(`getAllNeedParametersForForm?sessionId=${sessionID}&formId=${formID}`);
    await sessionManager.paramsManager.getParameterValues(data, formID, true);
    setOpen(true)
  }, [sessionManager, sessionID, formID]);

  return (
    <>
      <div onClick={fillReportParameters}>
        {reportProcessing
          ? <Loader size={'medium'} type={'pulsing'} />
          : <img src={menuIconsDict['run']} alt={'run'}/>}
        <div>{program.displayName}</div>
      </div>
      {open && <ProgramParametersList
        handleProcessing={handleProcessing}
        formId={formID} presentationId={formID}
        handleClose={() => {setOpen(false)}} programDisplayName={program.displayName}
      />}
    </>
  );
}
