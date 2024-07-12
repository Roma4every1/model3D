import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { ParameterList } from 'entities/parameter';
import { updateProgramParameter, runProgram } from 'entities/program';


interface ReportParameterListProps {
  program: Program;
  setOpened: (opened: boolean) => void;
  setProcessing: (processing: boolean) => void;
}


/** Редактор параметров программы. */
export const ProgramParameters = ({program, setOpened, setProcessing}: ReportParameterListProps) => {
  const { t } = useTranslation();
  const { channels, parameters, runnable } = program;

  const onParameterChange = ({id}: Parameter, newValue: any) => {
    updateProgramParameter(program, id, newValue).then();
  };
  const run = () => {
    setProcessing(true); setOpened(false);
    runProgram(program).then(() => setProcessing(false));
  };
  const close = () => setOpened(false);

  return (
    <Dialog title={t(`program.${program.type}-parameters`)} onClose={close} style={{zIndex: 99}}>
      <ParameterList list={parameters} channels={channels} onChange={onParameterChange}/>
      <DialogActionsBar>
        <Button onClick={run} disabled={!runnable}>{t('base.run')}</Button>
        <Button onClick={close}>{t('base.cancel')}</Button>
      </DialogActionsBar>
    </Dialog>
  );
};
