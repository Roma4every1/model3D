import type { SlideElement, SlideButtonPayload } from '../lib/slide.types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePrograms, updateProgramParameter, runProgram } from 'entities/program';
import { handleSlideAction } from '../store/slide.thunks';

import { Button } from 'antd';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { ParameterList } from 'entities/parameter';


interface SlideButtonProps {
  id: FormID;
  element: SlideElement;
}
interface SlideProgramParameterListProps {
  id: FormID;
  pid: ProgramID;
  close: () => void;
}

export const SlideButton = ({id, element}: SlideButtonProps) => {
  const [opened, setOpened] = useState(false);
  const close = () => setOpened(false);
  const payload = element.payload as SlideButtonPayload;

  const onClick = () => {
    if (opened || !payload?.program) return;
    handleSlideAction(id, payload).then(open => open && setOpened(true));
  };

  return (
    <>
      <Button className={'slide-button'} style={element.style} onClick={onClick}>
        {element.title}
      </Button>
      {opened && <SlideProgramParameterList id={id} pid={payload.program} close={close}/>}
    </>
  );
};

const SlideProgramParameterList = ({id, pid, close}: SlideProgramParameterListProps) => {
  const { t } = useTranslation();
  const program = usePrograms(id).find(p => p.id.endsWith(pid));

  const onChange = (p: Parameter, newValue: any) => {
    updateProgramParameter(program, p.id, newValue).then();
  };
  const run = () => {
    close();
    runProgram(program).then();
  };

  return (
    <Dialog title={program.displayName} onClose={close} style={{zIndex: 99}}>
      <ParameterList list={program.parameters} channels={program.channels} onChange={onChange}/>
      <DialogActionsBar>
        <Button onClick={run} disabled={!program.runnable}>{t('base.ok')}</Button>
        <Button onClick={close}>{t('base.cancel')}</Button>
      </DialogActionsBar>
    </Dialog>
  );
};
