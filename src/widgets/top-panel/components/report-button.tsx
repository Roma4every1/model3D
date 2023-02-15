import { ThunkDispatch } from 'redux-thunk';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Loader } from '@progress/kendo-react-indicators';
import { ReportParamList } from './report-param-list';
import { fetchReportsParameters } from 'entities/reports';
import runProgramIcon from 'assets/images/menu/run-program.png';


interface ReportButtonProps {
  id: FormID,
  report: ReportInfo,
}


export const ReportButton = ({id, report}: ReportButtonProps) => {
  const dispatch = useDispatch<ThunkDispatch<WState, any, any>>();

  const [opened, setOpened] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fillReportParameters = async () => {
    setProcessing(true);
    const onLoad = () => { setProcessing(false); setOpened(true); };
    dispatch(fetchReportsParameters(report.id)).then(onLoad);
  };

  return (
    <>
      <div onClick={fillReportParameters}>
        {processing
          ? <Loader size={'medium'} type={'pulsing'} />
          : <img src={runProgramIcon} alt={'run'}/>}
        <div>{report.displayName}</div>
      </div>
      {opened && <ReportParamList
        id={id} report={report}
        close={() => setOpened(false)} setProcessing={setProcessing}
      />}
    </>
  );
};
