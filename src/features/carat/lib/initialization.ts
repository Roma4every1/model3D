import { CaratStage } from '../rendering/stage';
import { CaratDrawer } from '../rendering/drawer';
import { getCaratChannelType, findIntervalsIndexes } from './channels';
import { drawerConfig } from './constants';


/** Функция, создающая состояние каротажа по её начальным настройкам. */
export function settingsToState(formState: FormState, channelDict: ChannelDict): CaratState {
  const channels = formState.channels;
  const init: CaratFormSettings = formState.settings;
  init.columns.sort(sortColumnsFn);

  for (const column of init.columns) {
    for (const attachedChannel of column.channels) {
      const channel = channelDict[attachedChannel.name];
      const channelType = getCaratChannelType(channel);

      attachedChannel.type = channelType;
      attachedChannel.applied = false;

      if (channelType === 'intervals') {
        attachedChannel.info = findIntervalsIndexes(channel);
      }
    }
  }

  const lookupNames: ChannelName[] = [];
  for (const name of channels) lookupNames.push(...channelDict[name].info.lookupChannels);

  const zones = init.settings.zones;
  const stage = new CaratStage(init, zones, new CaratDrawer(drawerConfig));
  const observer = new ResizeObserver(() => { stage.resize(); stage.render(); });
  return {stage, canvas: null, activeGroup: null, zones, lookupNames, observer};
}

function sortColumnsFn(a: CaratColumnInit, b: CaratColumnInit) {
  return a.settings.index - b.settings.index;
}

/** Определяет ширину трека по ширинам колонок. */
export function calculateTrackWidth(columns: CaratColumnInit[]) {
  let trackWidth = 0;
  for (const column of columns) {
    // const { type, width } = column.settings;
    // if (type === 'normal') trackWidth += width;
    const id = column.id;
    const width = column.settings.width;
    if (id !== 'track' && id !== 'correlations') trackWidth += width;
  }
  return CaratDrawer.ratio * trackWidth;
}

export function applyIndexesToModel(model: CaratAttachedChannel, columns: ChannelColumn[]) {
  if (model.type === 'intervals') {
    const topName = model.info.top.name;
    const baseName = model.info.base.name;

    columns.forEach(({ Name: name }, i) => {
      if (name === topName) return model.info.top.index = i;
      if (name === baseName) return model.info.base.index = i;
    });
  }
  model.applied = true;
}
