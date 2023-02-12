import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { presentationStateSelector } from '../store/presentations.selectors';
import { fetchPresentationState } from '../store/presentations.thunks';
import { stateNeedFetch, stateNotLoaded, formFetchStateSelector } from 'entities/fetch-state';

import { Grid } from './grid';
import { MultiMap } from '../../../features/multi-map/multi-map';


/** Презентация: клиент типа `grid`. */
export const Presentation = ({id}: {id: FormID}) => {
  const dispatch = useDispatch();
  const fetchState: FetchState = useSelector(formFetchStateSelector.bind(id));
  const state: PresentationState = useSelector(presentationStateSelector.bind(id));

  useEffect(() => {
    if (stateNeedFetch(fetchState)) dispatch(fetchPresentationState(id));
  }, [fetchState, id, dispatch]);

  if (stateNotLoaded(fetchState)) return <PresentationSkeleton/>;
  if (fetchState.details) return <PresentationFetchError details={fetchState.details}/>;

  const multiMapChannel = state.settings.multiMapChannel;
  if (multiMapChannel) return <MultiMap formID={id} channel={multiMapChannel}/>;

  return <Grid id={id} layout={state.layout}/>;
};

const PresentationSkeleton = () => {
  return <div className={'form-container'}>Загрузка...</div>;
};

const PresentationFetchError = ({details}: {details: string}) => {
  return <div className={'map-not-found'}>{details}</div>;
};
