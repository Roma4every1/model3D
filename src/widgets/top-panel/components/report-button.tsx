import { ThunkDispatch } from 'redux-thunk';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Loader } from '@progress/kendo-react-indicators';
import { ReportParamList } from './report-param-list';
import { initializeActiveReport } from 'entities/reports';
import reportIcon from 'assets/images/reports/report.svg';
// import programIcon from 'assets/images/reports/program.svg';


interface ReportButtonProps {
  id: FormID,
  report: ReportModel,
}


export const ReportButton = ({id, report}: ReportButtonProps) => {
  const dispatch = useDispatch<ThunkDispatch<WState, any, any>>();

  const [opened, setOpened] = useState(false);
  const [processing, setProcessing] = useState(false);

  const createReport = processing ? undefined : () => {
    if (report.parameters) {
      setOpened(true);
    } else {
      setProcessing(true);
      const onLoad = () => { setProcessing(false); setOpened(true); };
      dispatch(initializeActiveReport(id, report.id)).then(onLoad);
    }
  };

  return (
    <>
      <div onClick={createReport}>
        {processing
          ? <Loader size={'medium'} type={'pulsing'} />
          : <img src={reportIcon} alt={'run'}/>}
        <div>{report.displayName}</div>
      </div>
      {opened && <ReportParamList
        id={id} report={report}
        close={() => setOpened(false)}
      />}
    </>
  );
};
