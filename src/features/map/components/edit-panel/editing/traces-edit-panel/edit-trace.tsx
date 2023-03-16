import {BigButton} from "../../../../../../shared/ui";
import editTraceIcon from './../../../../../../assets/images/trace/trace_edit_L.png'

interface EditTraceProps {
  mapState: MapState,
  formID: FormID,
}

export const EditTrace = ({}: EditTraceProps) => {
  return <BigButton
    text={'Редактирование'} icon={editTraceIcon}
    action={()=>{}} disabled={true}
  />;
}
