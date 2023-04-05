import {BigButton} from "../../../../../../shared/ui";
import saveTraceIcon from "../../../../../../assets/images/trace/trace_save_L.png";

interface SaveTraceProps {
  mapState: MapState,
  formID: FormID,
}

export const SaveTrace = ({}: SaveTraceProps) => {
  return <BigButton
    text={'Сохранить в файл'} icon={saveTraceIcon}
    action={()=>{}} disabled={true}
  />;
}
