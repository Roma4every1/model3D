import { useEffect } from 'react';
import { fetchPresentationState } from '../store/presentation.thunks';
import { useFetchState } from 'entities/fetch-state';

import { TextInfo } from 'shared/ui';
import { Grid } from './grid';
import { MultiMap } from 'features/multi-map';
import { PresentationSkeleton } from './plugs';


export interface PresentationProps {
  /** ID презентации. */
  id: ClientID;
  /** Состояние презентации. */
  state: PresentationState | undefined;
}


/** Презентация: клиент типа `grid`. */
export const Presentation = ({id, state}: PresentationProps) => {
  const fetchState = useFetchState(id);

  useEffect(() => {
    if (fetchState.needFetch()) fetchPresentationState(id).then();
  }, [fetchState, id]);

  if (fetchState.notLoaded()) return <PresentationSkeleton/>;
  if (fetchState.error()) return <TextInfo text={fetchState.details}/>;

  if (state.settings.multiMapChannel && state.channels.length) {
    return <MultiMap id={id} channels={state.channels} openedChildren={state.openedChildren}/>;
  } else {
    return <Grid id={id} model={state.layout}/>;
  }
};
