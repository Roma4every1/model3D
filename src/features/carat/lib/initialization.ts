import { CaratDrawer } from './drawer';
import { CaratViewModel } from './view-model';
import { isLithologyChannel, findLithologyIndexes } from './channels';
import { caratDrawerSettings } from './constants';


export function settingsToState(channelDict: ChannelDict, settings: CaratFormSettings): CaratState {
  const caratData: CaratData = {};
  const scale = CaratDrawer.pixelPerMeter / (settings.settings.metersInMeter ?? 400);

  const columns = settings.columns.filter((column) => column?.channels.length);
  if (columns.length) columns[0].active = true;

  for (const column of columns) {
    for (const channelName of column.channels) {
      const channelPlugins = column.plugins[channelName];
      if (!channelPlugins) continue;
      const channel = channelDict[channelName];

      if (channel && !caratData[channelName] && isLithologyChannel(channel)) {
        const info = findLithologyIndexes(channel);
        caratData[channelName] = {type: 'intervals', info, applied: false, data: null};
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
