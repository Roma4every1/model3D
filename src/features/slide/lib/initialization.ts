import type { CSSProperties } from 'react';
import type { SlideState } from '../store/slide.store';
import { XElement, InitializationError } from 'shared/lib';


export function settingsToSlideState(payload: FormStatePayload): SlideState {
  const channel = payload.state.channels[0];
  if (!channel) throw new InitializationError('table.no-channel-error');

  const extra = payload.state.extra as XElement;
  const styleElements = extra?.getChild('styles')?.getChildren('style');
  if (!styleElements || styleElements.length === 0) return {styles: {}};

  const styles: Record<string, CSSProperties> = {};
  for (const element of styleElements) {
    const { id, ...style } = element.getAttributes();
    if (id) styles[id] = style;
  }
  return {styles};
}
