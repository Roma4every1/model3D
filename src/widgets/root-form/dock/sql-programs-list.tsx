import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ProgramButton } from 'entities/reports';
import { programsSelector } from 'widgets/presentation';


export const SqlProgramsList = ({formID}: PropsFormID) => {
  const programList: ProgramListData = useSelector(programsSelector.bind(formID));

  const visiblePrograms = useMemo<ProgramListData>(() => {
    if (!programList) return [];
    return programList.filter((program) => program.visible);
  }, [programList]);

  const mapProgramList = (program: ProgramListItem) => {
    return <ProgramButton key={program.id} formID={formID} program={program}/>;
  };

  if (visiblePrograms.length === 0) return <EmptyList text={'Программы отсутствуют.'}/>;
  return <div className={'program-list'}>{visiblePrograms.map(mapProgramList)}</div>;
};

const EmptyList = ({text}: {text: string}) => {
  return <div className={'program-list-empty'}><span>{text}</span></div>
};
