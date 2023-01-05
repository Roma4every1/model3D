import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Loader } from "@progress/kendo-react-indicators";
import ProgramParametersList from "./program-parameters-list";
import { runProgramIcon } from "../../dicts/images";
import { selectors } from "../../store";
import { API } from "../../api/api";


interface ProgramButtonProps {
  formID: FormID,
  program: ProgramListItem,
}


export default function ProgramButton({formID, program}: ProgramButtonProps) {
  const sessionManager = useSelector(selectors.sessionManager);

  const programID = program.id;
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsIsOpen] = useState(false);

  const fillReportParameters = useCallback(async () => {
    await sessionManager.paramsManager.loadFormParameters(programID, true);
    const res = await API.forms.getAllNeedParametersForForm(programID);
    if (!res.ok) return sessionManager.handleWindowWarning(res.data);
    await sessionManager.paramsManager.getParameterValues(res.data, programID, true);
    setIsIsOpen(true);
  }, [programID, sessionManager]);

  return (
    <>
      <div onClick={fillReportParameters}>
        {isProcessing
          ? <Loader size={'medium'} type={'pulsing'} />
          : <img src={runProgramIcon} alt={'run'}/>}
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
