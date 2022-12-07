import { useSelector } from "react-redux";
import { selectors } from "../../store";
import { Skeleton } from "@progress/kendo-react-indicators";
import ParametersList from "./parameters-list";


/** Компонент списка параметров формы.
 * @see ParametersList
 * */
export default function FormParametersList({formId}: {formId: FormID}) {
  const formParams: FormParameter[] = useSelector((selectors.formParams.bind(formId)));
  return !formParams
    ? <Skeleton shape={'rectangle'} animation={{type: 'wave'}}/>
    : <ParametersList parametersJSON={formParams} />
}
