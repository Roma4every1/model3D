import { CaratStage } from '../rendering/stage';
import { CaratDrawer } from '../rendering/drawer';
import { identifyCaratChannel, applyStyle } from './channels';
import { drawerConfig } from './constants';


/** Функция, создающая состояние каротажа по её начальным настройкам. */
export function settingsToState(formState: FormState, channelDict: ChannelDict): CaratState {
  const channels = formState.channels;
  const init: CaratFormSettings = formState.settings;
  init.columns.sort(sortColumnsFn);

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

  const stage = new CaratStage(init, new CaratDrawer(drawerConfig));
  const observer = new ResizeObserver(() => { stage.resize(); stage.render(); });

  const track = stage.getActiveTrack();
  const activeGroup = stage.getActiveTrack().getActiveGroup();

  const curveGroup = activeGroup?.hasCurveColumn()
    ? activeGroup
    : track.getGroups().find((group) => group.hasCurveColumn());

  return {
    stage, canvas: null, observer,
    activeGroup, curveGroup, activeCurve: null,
    lookupNames, lastData: {},
  };
}

function sortColumnsFn(a: CaratColumnInit, b: CaratColumnInit) {
  return a.settings.index - b.settings.index;
}

/** Определяет ширину трека по ширинам колонок. */
export function calculateTrackWidth(columns: CaratColumnInit[]) {
  let trackWidth = 0;
  for (const column of columns) {
    const { type, width } = column.settings;
    if (type === 'normal') trackWidth += width;
  }
  return trackWidth;
}
