import { CaratStage } from '../rendering/stage';
import { identifyCaratChannel, applyStyle } from './channels';
import { drawerConfig } from './constants';


/** Создаёт состояние каротажа по её начальным настройкам. */
export function settingsToState(formState: FormState, channelDict: ChannelDict): CaratState {
  const channels = formState.channels;
  const init: CaratFormSettings = formState.settings;
  init.columns.sort((a, b) => a.settings.index - b.settings.index);

  for (const column of init.columns) {
    for (const attachedChannel of column.channels) {
      const channel = channelDict[attachedChannel.name];
      identifyCaratChannel(attachedChannel, channel);

      if (attachedChannel.type === 'curve-data') {
        const name = attachedChannel.name;
        const idx = channels.findIndex(c => c === name);
        channels.splice(idx, 1);
      } else {
        applyStyle(attachedChannel, channel, channelDict);
      }
    }
  }

  const lookupNames: ChannelName[] = [];
  for (const name of channels) lookupNames.push(...channelDict[name].info.lookupChannels);

  const stage = new CaratStage(init, drawerConfig);
  const observer = new ResizeObserver(() => { stage.resize(); stage.render(); });

  const track = stage.getActiveTrack();
  const activeGroup = track.getActiveGroup();

  const curveGroup = activeGroup?.hasCurveColumn()
    ? activeGroup
    : track.getGroups().find((group) => group.hasCurveColumn());

  return {
    stage, canvas: undefined, observer,
    activeGroup, curveGroup, activeCurve: null,
    lookupNames, lastData: {},
  };
}

/** Возвращает настройки формы по состоянию формы. */
export function caratStateToSettings(id: FormID, state: CaratState): CaratFormSettings {
  const settings = state.stage.getCaratSettings();
  const columns = state.stage.getActiveTrack().getInitColumns();
  return {id, settings, columns};
}
