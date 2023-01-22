import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@progress/kendo-react-indicators";
import ProgramButton from "../sql-programs/program-button";
import { actions, selectors } from "../../store";
import { fetchFormPrograms } from "../../store/thunks";


export const SqlProgramsList = ({formID}: PropsFormID) => {
  const dispatch = useDispatch();
  const programList: FetchState<ProgramListData> = useSelector(selectors.formPrograms.bind(formID));

  // добавить хранилище для формы
  useEffect(() => {
    if (!programList) dispatch(actions.addFormPrograms(formID))
  }, [programList, dispatch, formID]);

  // загрузить данные о программах и проверить их на видимость
  useEffect(() => {
    if (programList && programList.success === undefined && programList.loading === false)
      dispatch(fetchFormPrograms.bind(formID));
  }, [programList, formID, dispatch]);

  const visiblePrograms = useMemo<ProgramListData | null>(() => {
    if (!programList?.data || typeof programList.data === 'string') return null;
    return programList.data.filter((program) => program.visible);
  }, [programList]);

  const mapProgramList = (program: ProgramListItem) => {
    return <ProgramButton key={program.id} formID={formID} program={program}/>;
  };

  const notReady = !programList || programList.loading || programList.success === undefined;

  if (notReady) return <ProgramsListLoading/>;
  if (programList.success === false) return <EmptyList text={'Не удалось загрузить список программ.'}/>;
  if (visiblePrograms.length === 0) return <EmptyList text={'Программы отсутствуют.'}/>;

  return <div className={'program-list'}>{visiblePrograms.map(mapProgramList)}</div>;
};

const EmptyList = ({text}: {text: string}) => {
  return <div className={'program-list-empty'}><span>{text}</span></div>
};

const ProgramsListLoading = () => {
  return (
    <div className={'program-list'}>
      <ProgramButtonSkeleton/>
      <ProgramButtonSkeleton/>
      <ProgramButtonSkeleton/>
    </div>
  );
};
const ProgramButtonSkeleton = () => {
  return (
    <div>
      <Skeleton shape={'rectangle'} animation={{type: 'wave'}}/>
      <div>
        <Skeleton shape={'text'} animation={{type: 'wave'}} style={{width: '100px', height: '18px'}}/>
        <Skeleton shape={'text'} animation={{type: 'wave'}} style={{width: '70px', height: '18px'}}/>
        <Skeleton shape={'text'} animation={{type: 'wave'}} style={{width: '130px', height: '18px'}}/>
      </div>
    </div>
  );
};
