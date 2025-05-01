import { useState } from 'react';
import { Button } from 'antd';
import { ProgramParameters } from './program-parameters';
import { initializeProgram, prepareProgram } from 'entities/program';

import reportIcon from 'assets/common/report.svg';
import programIcon from 'assets/common/program.svg';


export const ProgramButton = ({program}: {program: Program}) => {
  const [opened, setOpened] = useState(false);
  const [processing, setProcessing] = useState(false);
  const disabled = !program.available || processing;

  const onClick = disabled ? undefined : () => {
    if (opened) return;
    setProcessing(true);

    const onLoad = () => { setProcessing(false); setOpened(true); };
    if (program.parameters) {
      prepareProgram(program).then(onLoad);
    } else {
      initializeProgram(program).then(onLoad);
    }
  };

  return (
    <>
      <Button
        icon={<img src={program.type === 'report' ? reportIcon : programIcon} alt={program.type}/>}
        onClick={onClick} disabled={disabled} loading={processing}
      >
        {program.displayName}
      </Button>
      {opened && <ProgramParameters
        program={program} setOpened={setOpened} setProcessing={setProcessing}
      />}
    </>
  );
};
