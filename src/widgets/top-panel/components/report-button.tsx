import { ThunkDispatch } from 'redux-thunk';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Loader } from '@progress/kendo-react-indicators';
import { ReportParamList } from './report-param-list';
import { initializeActiveReport, refreshReport } from 'entities/reports';

import reportIcon from 'assets/images/reports/report.svg';
import programIcon from 'assets/images/reports/program.svg';


interface ReportButtonProps {
  /** ID презентации. */
  id: FormID;
  /** Модель отчёта. */
  report: ReportModel;
}


export const ReportButton = ({id, report}: ReportButtonProps) => {
  const dispatch = useDispatch<ThunkDispatch<WState, any, any>>();

  const [opened, setOpened] = useState(false);
  const [processing, setProcessing] = useState(false);

  const onClick = processing ? undefined : () => {
    if (opened) return;
    setProcessing(true);

    const onLoad = () => { setProcessing(false); setOpened(true); };
    if (report.parameters) {
      dispatch(refreshReport(id, report)).then(onLoad);
    } else {
      dispatch(initializeActiveReport(id, report.id)).then(onLoad);
    }
  };

  return (
    <>
      <div onClick={onClick}>
        {processing
          ? <Loader size={'medium'} type={'pulsing'} />
          : <img src={report.type === 'report' ? reportIcon : programIcon} alt={'run'}/>}
        <div>{report.displayName}</div>
      </div>
      {opened && <ReportParamList id={id} report={report} close={() => setOpened(false)}/>}
    </>
  );
};
