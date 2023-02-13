import { useSelector, useDispatch } from 'react-redux';
import { ParameterList, updateParam } from 'entities/parameters';
import { rootActiveChildIDSelector, activeChildParamsSelector } from '../../store/root-form.selectors';
import { reloadChannels } from 'entities/channels';


/** Редактор параметров текущей презентации. */
export const PresentationParamList = () => {
  const dispatch = useDispatch();
  const activeChildID = useSelector(rootActiveChildIDSelector);
  const activeChildParams = useSelector(activeChildParamsSelector);

  const onChange = ({id, relatedChannels}: Parameter, newValue: any) => {
    dispatch(updateParam(activeChildID, id, newValue))
    if (relatedChannels.length) dispatch(reloadChannels(relatedChannels));
  };

  return <ParameterList params={activeChildParams ?? []} onChange={onChange}/>;
};
