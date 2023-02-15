import { useDispatch } from 'react-redux';
import { ParameterList, updateParam } from 'entities/parameters';
import { reloadChannels } from 'entities/channels';


interface PresentationParamListProps {
  list: Parameter[],
  activeID: FormID,
}


/** Редактор параметров текущей презентации. */
export const PresentationParamList = ({list, activeID}: PresentationParamListProps) => {
  const dispatch = useDispatch();

  const onChange = ({id, relatedChannels}: Parameter, newValue: any) => {
    dispatch(updateParam(activeID, id, newValue))
    if (relatedChannels.length) dispatch(reloadChannels(relatedChannels));
  };

  return <ParameterList params={list ?? []} onChange={onChange}/>;
};
