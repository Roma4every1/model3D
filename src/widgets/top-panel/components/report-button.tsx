import { useState } from 'react';
import { Loader } from '@progress/kendo-react-indicators';
import { ReportParameterList } from './report-parameter-list';
import { initializeActiveReport, prepareReport } from 'entities/report';

import reportIcon from 'assets/reports/report.svg';
import programIcon from 'assets/reports/program.svg';


export const ReportButton = ({report}: {report: ReportModel}) => {
  const [opened, setOpened] = useState(false);
  const [processing, setProcessing] = useState(false);

  const disabled = !report.available || processing;
  const className = disabled ? 'disabled' : undefined;
  const style = !report.available ? {filter: 'grayscale(1)'} : undefined;

  const onClick = disabled ? undefined : () => {
    if (opened) return;
    setProcessing(true);

    const onLoad = () => { setProcessing(false); setOpened(true); };
    if (report.parameters) {
      prepareReport(report).then(onLoad);
    } else {
      initializeActiveReport(report).then(onLoad);
    }
  };

  return (
    <>
      <div className={className} style={style} onClick={onClick}>
        {processing
          ? <Loader size={'medium'} type={'pulsing'} />
          : <img src={report.type === 'report' ? reportIcon : programIcon} alt={'run'}/>}
        <div>{report.displayName}</div>
      </div>
      {opened && <ReportParameterList
        report={report} setOpened={setOpened} setProcessing={setProcessing}
      />}
    </>
  );
};
