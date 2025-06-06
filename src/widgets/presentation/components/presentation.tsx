import { TextInfo } from 'shared/ui';
import { MultiMap } from 'features/multi-map';
import { Grid } from './grid';


export interface PresentationProps {
  /** Состояние презентации. */
  state: PresentationState | undefined;
}

/** Презентация: клиент типа `grid`. */
export const Presentation = ({state}: PresentationProps) => {
  if (!state || state.loading.status === 'init') return <div className={'wm-skeleton'}/>;
  const { id, channels, layout, loading } = state;
  if (loading.error) return <TextInfo text={loading.error}/>;

  if (state.settings.mapLayoutManager && channels.length) {
    return <MultiMap id={id} channels={channels}/>;
  } else {
    return <Grid id={id} model={layout}/>;
  }
};
