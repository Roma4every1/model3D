import { useSelector } from 'react-redux';
import { Skeleton } from '@progress/kendo-react-indicators';
import { ParametersList, formParamsSelector } from 'entities/parameters';


/** Компонент списка параметров формы.
 * @see ParametersList
 * */
export const FormParametersList = ({formID}: PropsFormID) => {
  const formParams: FormParameter[] = useSelector(formParamsSelector.bind(formID));

  return !formParams
    ? <Skeleton shape={'rectangle'} animation={{type: 'wave'}}/>
    : <ParametersList params={formParams}/>;
};
