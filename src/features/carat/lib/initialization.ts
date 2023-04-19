import { CaratStage } from '../rendering/stage';
import { CaratDrawer } from '../rendering/drawer';
import { isLithologyChannel, findLithologyIndexes } from './channels';
import { drawerConfig } from './constants';


export function settingsToState(channelDict: ChannelDict, init: CaratFormSettings): CaratState {
  const caratData: CaratData = {};
  init.columns = init.columns.filter((column) => column?.channels.length);

  for (const column of init.columns) {
    for (const { name } of column.channels) {
      const channel = channelDict[name];
      if (channel && !caratData[name] && isLithologyChannel(channel)) {
        const info = findLithologyIndexes(channel);
        caratData[name] = {type: 'intervals', info, applied: false, data: null};
      }
    }
  }

  const drawer = new CaratDrawer(drawerConfig);
  return {stage: new CaratStage(init, drawer), canvas: null, activeColumn: null};
}

export function applyIndexesToModel(model: CaratDataModel, columns: ChannelColumn[]) {
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
