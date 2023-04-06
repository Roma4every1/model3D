import { CaratDrawer } from './drawer';
import { CaratViewModel } from './view-model';
import { isLithologyChannel, findLithologyIndexes } from './channels';
import { caratDrawerSettings } from './constants';


export function settingsToState(channelDict: ChannelDict, init: CaratFormSettings): CaratState {
  const caratData: CaratData = {};
  const scale = CaratDrawer.pixelPerMeter / (init.settings.scale ?? 400);

  const columns = init.columns.filter((column) => column?.channels.length);
  if (columns.length) columns[0].active = true;

  for (const column of columns) {
    for (const { name } of column.channels) {
      const channel = channelDict[name];
      if (channel && !caratData[name] && isLithologyChannel(channel)) {
        const info = findLithologyIndexes(channel);
        caratData[name] = {type: 'intervals', info, applied: false, data: null};
      }
    }
  }

  return {
    data: caratData,
    model: new CaratViewModel(columns, {y: 0, scale}),
    drawer: new CaratDrawer(caratDrawerSettings),
    canvas: null,
    activeColumn: columns[0] ?? null,
  };
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
