import { useSlideStore } from './slide.store';
import { settingsToSlideState } from '../lib/initialization';


export function createSlideState(payload: FormStatePayload): void {
  const id = payload.state.id;
  useSlideStore.setState({[id]: settingsToSlideState(payload)});
}
