import { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toolbar } from "@progress/kendo-react-buttons";
import { Skeleton } from "@progress/kendo-react-indicators";
import ProgramButton from "./ProgramButton";
import { actions } from "../../../../../store";
import { fetchFormPrograms } from "../../../../../store/thunks";


const CustomSkeleton = ({width}: {width: number}) => {
  return (
    <Skeleton
      shape={'rectangle'} animation={{type: 'wave'}}
      style={{width: width + 'px', height: '24px', borderRadius: '4px', margin: '0 2px'}}
    />
  );
}

const ProgramsListLoading = () => {
  return (
    <Toolbar style={{padding: '4px'}}>
      <CustomSkeleton width={100}/>
      <CustomSkeleton width={130}/>
      <CustomSkeleton width={90}/>
    </Toolbar>
  );
}

const sessionIDSelector = (state: WState) => state.sessionId;
const sessionManagerSelector = (state: WState) => state.sessionManager;

export default function SqlProgramsList({formId: formID}: {formId: FormID}) {
  const dispatch = useDispatch();
  const sessionID = useSelector(sessionIDSelector);
  const sessionManager = useSelector(sessionManagerSelector);
  const programList = useSelector((state: WState) => state.programs[formID]);

  // добавить хранилище для формы
  useEffect(() => {
    if (!programList) dispatch(actions.addFormPrograms(formID))
  }, [programList, dispatch, formID]);

  // загрузить данные о программах и проверить их на видимость
  useEffect(() => {
    if (programList && programList.success === undefined && programList.loading === false)
      dispatch(fetchFormPrograms(formID, sessionManager, sessionID));
  }, [programList, sessionManager, sessionID, dispatch, formID]);

  const visiblePrograms = useMemo<ProgramListData | null>(() => {
    if (!programList?.data || typeof programList.data === 'string') return null;
    return programList.data.filter((program) => program.visible);
  }, [programList]);

  const mapProgramList = useCallback((program: ProgramListItem) => {
    return (
      <ProgramButton
        key={program.id} formID={formID} program={program}
        sessionManager={sessionManager} sessionID={sessionID}
      />
    );
  },[formID, sessionID, sessionManager]);

  const notReady = !programList || programList.loading || programList.success === undefined;

  if (notReady) return <ProgramsListLoading/>;
  if (programList.success === false) return <div>Не удалось загрузить список программ.</div>;
  if (programList.data.length === 0) return <div>Программы отсутствуют.</div>;
  if (visiblePrograms.length === 0) return <div>Нет видимых програм.</div>

  return (
    <Toolbar style={{padding: '4px'}}>
      {visiblePrograms.map(mapProgramList)}
    </Toolbar>
  );
}
