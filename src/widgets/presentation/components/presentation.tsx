import { useEffect } from 'react';
import { useDispatch, useSelector } from 'shared/lib';
import { fetchPresentationState } from '../store/presentation.thunks';
import { stateNeedFetch, stateNotLoaded, formFetchStateSelector } from 'entities/fetch-state';

import { TextInfo } from 'shared/ui';
import { Grid } from './grid';
import { MultiMap } from 'features/multi-map/multi-map';
import { PresentationSkeleton } from './plugs';


export interface PresentationProps {
  /** ID презентации. */
  id: ClientID;
  /** Состояние презентации. */
  state: PresentationState | undefined;
}


/** Презентация: клиент типа `grid`. */
export const Presentation = ({id, state}: PresentationProps) => {
  const dispatch = useDispatch();
  const fetchState: FetchState = useSelector(formFetchStateSelector.bind(id));

  useEffect(() => {
    if (stateNeedFetch(fetchState)) dispatch(fetchPresentationState(id));
  }, [fetchState, id, dispatch]);

  if (stateNotLoaded(fetchState)) return <PresentationSkeleton/>;
  if (fetchState.details) return <TextInfo text={fetchState.details}/>;

  const multiMapChannel = state.settings.multiMapChannel;
  if (multiMapChannel) return <MultiMap id={id} channelName={multiMapChannel}/>;

  return <Grid id={id} model={state.layout}/>;
};
