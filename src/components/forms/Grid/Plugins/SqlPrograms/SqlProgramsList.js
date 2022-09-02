import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Toolbar } from "@progress/kendo-react-buttons";
import { Skeleton } from "@progress/kendo-react-indicators";
import ProgramButton from "./ProgramButton";


const ProgramNameButton = ({formID, program}) => {
  const {id, displayName, needCheckVisibility, paramsForCheckVisibility} = program;
  return (
    <ProgramButton
      formID={id} presentationId={formID} programDisplayName={displayName}
      needCheckVisibility={needCheckVisibility} paramsForCheckVisibility={paramsForCheckVisibility}
    />
  );
}

const CustomSkeleton = ({width}) => {
  return (
    <Skeleton
      shape={'rectangle'} animation={{type: 'wave'}}
      style={{width: width + 'px', height: '24px', borderRadius: '4px', margin: '0 2px'}}
    />
  );
}

const ProgramsListLoading = () => {
  return (
    <div style={{display: 'flex', alignItems: 'center', padding: '2px'}}>
      <CustomSkeleton width={100}/>
      <CustomSkeleton width={130}/>
      <CustomSkeleton width={90}/>
    </div>
  );
}

export default function SqlProgramsList({formId: formID}) {
  const sessionID = useSelector((state) => state.sessionId);
  const sessionManager = useSelector((state) => state.sessionManager);

  const [state, setState] = useState({data: null, loaded: false, success: undefined});

  useEffect(() => {
    let ignore = false;
    if (formID) {
      async function fetchData() {
        if (ignore) return;
        const data = await sessionManager.fetchData(`programsList?sessionId=${sessionID}&formId=${formID}`);
        data
          ? setState({loaded: true, data: data, success: true})
          : setState({loaded: true, data: null, success: false});
      }
      fetchData();
    }
    return () => { ignore = true; }
  }, [sessionID, formID, sessionManager]);

  if (!state.loaded) return <ProgramsListLoading/>;
  if (state.success === false || !formID) return <div>Не удалось загрузить список программ.</div>;
  if (state.data.length === 0) return <div>Программы отсутствуют.</div>

  return (
    <Toolbar style={{ padding: 1 }}>
      {state.data.map(program => <ProgramNameButton key={program.id} formID={formID} program={program}/>)}
    </Toolbar>
  );
}
