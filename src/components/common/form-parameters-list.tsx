import { useSelector } from 'react-redux';
import { Skeleton } from '@progress/kendo-react-indicators';
import { ParametersList } from './parameters-list';
import { selectors } from '../../store';


/** Компонент списка параметров формы.
 * @see ParametersList
 * */
export const FormParametersList = ({formID}: PropsFormID) => {
  const formParams: FormParameter[] = useSelector(selectors.formParams.bind(formID));

  return !formParams
    ? <Skeleton shape={'rectangle'} animation={{type: 'wave'}}/>
    : <ParametersList params={formParams}/>;
};
