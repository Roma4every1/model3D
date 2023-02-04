import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Loader } from '@progress/kendo-react-indicators';
import { ProgramParametersList } from './program-parameters-list';
import { actions, sessionManager } from '../../store';
import { API } from '../../api/api';
import runProgramIcon from '../../assets/images/menu/run-program.png';


interface ProgramButtonProps {
  formID: FormID,
  program: ProgramListItem,
}


export const ProgramButton = ({formID, program}: ProgramButtonProps) => {
  const programID = program.id;
  const dispatch = useDispatch();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsIsOpen] = useState(false);

  const fillReportParameters = async () => {
    await sessionManager.paramsManager.loadFormParameters(programID, true);
    const res = await API.forms.getAllNeedParametersForForm(programID);
    if (!res.ok) { dispatch(actions.setWindowWarning(res.data)); return; }
    await sessionManager.paramsManager.getParameterValues(res.data, programID, true);
    setIsIsOpen(true);
  };

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
};
