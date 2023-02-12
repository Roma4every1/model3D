import { ThunkDispatch } from 'redux-thunk';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Loader } from '@progress/kendo-react-indicators';
import { ProgramParametersList } from './program-parameters-list';
import { fetchReportsParameters } from 'entities/reports';
import runProgramIcon from 'assets/images/menu/run-program.png';


interface ProgramButtonProps {
  formID: FormID,
  program: ProgramListItem,
}


export const ProgramButton = ({formID, program}: ProgramButtonProps) => {
  const dispatch = useDispatch<ThunkDispatch<WState, any, any>>();

  const [isOpen, setIsIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fillReportParameters = async () => {
    setIsProcessing(true);
    const onLoad = () => { setIsProcessing(false); setIsIsOpen(true); };
    dispatch(fetchReportsParameters(program.id)).then(onLoad);
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
        formId={program.id} presentationId={formID}
        handleClose={() => setIsIsOpen(false)} programDisplayName={program.displayName}
      />}
    </>
  );
};
