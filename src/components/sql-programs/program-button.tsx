import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Loader } from "@progress/kendo-react-indicators";
import ProgramParametersList from "./program-parameters-list";
import { menuIconsDict } from "../../dicts/images";
import { selectors } from "../../store";


interface ProgramButtonProps {
  formID: FormID,
  program: ProgramListItem,
}


export default function ProgramButton({formID, program}: ProgramButtonProps) {
  const sessionID = useSelector(selectors.sessionID);
  const sessionManager = useSelector(selectors.sessionManager);

  const programID = program.id;
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsIsOpen] = useState(false);

  const fillReportParameters = useCallback(async () => {
    await sessionManager.paramsManager.loadFormParameters(programID, true);
    const path = `getAllNeedParametersForForm?sessionId=${sessionID}&formId=${programID}`;
    const data = await sessionManager.fetchData(path);
    await sessionManager.paramsManager.getParameterValues(data, programID, true, undefined);
    setIsIsOpen(true);
  }, [programID, sessionManager, sessionID]);

  return (
    <>
      <div onClick={fillReportParameters}>
        {isProcessing
          ? <Loader size={'medium'} type={'pulsing'} />
          : <img src={menuIconsDict['run']} alt={'run'}/>}
        <div>{program.displayName}</div>
      </div>
      {isOpen && <ProgramParametersList
        handleProcessing={setIsProcessing}
        formId={programID} presentationId={formID}
        handleClose={() => {setIsIsOpen(false)}} programDisplayName={program.displayName}
      />}
    </>
  );
}
