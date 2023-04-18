import saveTraceIcon from "../../../../assets/images/trace/trace_save_L.png";
import {BigButton} from "../../../../shared/ui";

interface SaveTraceProps {
  tracesState: TracesState
}

export const SaveTrace = ({}: SaveTraceProps) => {
  return <BigButton
    text={'Сохранить в файл'} icon={saveTraceIcon}
    action={()=>{}} disabled={true}
  />;
}
