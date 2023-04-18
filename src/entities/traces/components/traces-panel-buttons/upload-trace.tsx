import uploadTraceIcon from "../../../../assets/images/trace/trace_load_L.png";
import {BigButton} from "../../../../shared/ui";

interface UploadTraceProps {
  tracesState: TracesState
}

export const UploadTrace = ({}: UploadTraceProps) => {
  return <BigButton
    text={'Загрузить'} icon={uploadTraceIcon}
    action={()=>{}} disabled={true}
  />;
}
