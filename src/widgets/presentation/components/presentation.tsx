import { useEffect } from 'react';
import { fetchPresentationState } from '../store/presentation.thunks';
import { useFormFetchState, stateNeedFetch, stateNotLoaded } from 'entities/fetch-state';

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
  const fetchState: FetchState = useFormFetchState(id);

  useEffect(() => {
    if (stateNeedFetch(fetchState)) fetchPresentationState(id).then();
  }, [fetchState, id]);

  if (stateNotLoaded(fetchState)) return <PresentationSkeleton/>;
  if (fetchState.details) return <TextInfo text={fetchState.details}/>;

  const multiMapChannel = state.settings.multiMapChannel;
  if (multiMapChannel) return <MultiMap presentation={state} channelName={multiMapChannel}/>;

  return <Grid id={id} model={state.layout}/>;
};
