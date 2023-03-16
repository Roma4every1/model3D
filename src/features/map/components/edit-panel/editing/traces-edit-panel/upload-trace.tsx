import {BigButton} from "../../../../../../shared/ui";
import uploadTraceIcon from "../../../../../../assets/images/trace/trace_load_L.png";

interface UploadTraceProps {
  mapState: MapState,
  formID: FormID,
}

export const UploadTrace = ({}: UploadTraceProps) => {
  return <BigButton
    text={'Загрузить'} icon={uploadTraceIcon}
    action={()=>{}} disabled={true}
  />;
}
