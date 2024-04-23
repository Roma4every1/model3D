import { useState } from 'react';
import { Loader } from '@progress/kendo-react-indicators';
import { ReportParameterList } from './report-parameter-list';
import { initializeActiveReport, refreshReport } from 'entities/report';

import reportIcon from 'assets/images/reports/report.svg';
import programIcon from 'assets/images/reports/program.svg';


interface ReportButtonProps {
  /** ID презентации. */
  id: ClientID;
  /** Модель отчёта. */
  report: ReportModel;
}


export const ReportButton = ({id, report}: ReportButtonProps) => {
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
      refreshReport(id, report).then(onLoad);
    } else {
      initializeActiveReport(id, report.id).then(onLoad);
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
        id={id} report={report}
        setOpened={setOpened} setProcessing={setProcessing}
      />}
    </>
  );
};
