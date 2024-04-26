import { CaratStage } from '../rendering/stage';
import { CaratLoader } from './loader';
import { createColumnInfo } from 'entities/channel';
import { identifyCaratChannel, applyStyle } from './channels';

import {
  drawerConfig, caratChannelCriterionDict,
  inclinometryCriterion, pumpImageCriterion,
} from './constants';


/** Создаёт состояние каротажа по её начальным настройкам. */
export function settingsToCaratState(payload: FormStatePayload): CaratState {
  const { state: formState, channels: channelDict } = payload;
  const init: CaratFormSettings = formState.settings;
  init.columns.sort((a, b) => a.settings.index - b.settings.index);

  let curveDataChannel: CaratAttachedChannel;
  let inclinometryChannel: CaratAttachedChannel;
  const usedChannels = new Set<ChannelName>();
  const attachments: CaratAttachedChannel[] = [];

  for (const column of init.columns) {
    for (const attachedChannel of column.channels) {
      const channel = channelDict[attachedChannel.name];
      identifyCaratChannel(attachedChannel, channel);

      if (attachedChannel.type === 'curve-data') {
        curveDataChannel = attachedChannel;
      } if (attachedChannel.type === 'inclinometry') {
        const propertyName = caratChannelCriterionDict.inclinometry.inclinometry;
        const property = channel.config.properties.find(p => p.name === propertyName);
        const inclinometryDataChannel = property?.detailChannel;

        if (inclinometryDataChannel) {
          attachedChannel.inclinometry = {
            name: inclinometryDataChannel,
            info: createColumnInfo(channelDict[inclinometryDataChannel], inclinometryCriterion),
            dict: null,
          };

          inclinometryChannel = attachedChannel;
          usedChannels.add(attachedChannel.name);
        } else {
          delete attachedChannel.type;
        }
      } else if (attachedChannel.type === 'pump') {
        const propertyName = caratChannelCriterionDict.pump.pumpID;
        const property = channel.config.properties.find(p => p.name === propertyName);
        const pumpDataChannel = property.lookupChannels[0];

        if (pumpDataChannel) {
          attachedChannel.imageLookup = {
            name: pumpDataChannel,
            info: createColumnInfo(channelDict[pumpDataChannel], pumpImageCriterion),
            dict: null,
          };
          usedChannels.add(attachedChannel.name);
          attachedChannel.styles = [];
        } else {
          delete attachedChannel.type;
        }
      } else {
        applyStyle(attachedChannel, column.properties[attachedChannel.name], channel, channelDict);
      }

      if (attachedChannel.type && attachedChannel.type !== 'curve-data') {
        usedChannels.add(attachedChannel.name);
        attachments.push(attachedChannel);
      }
    }
  }

  const stage = new CaratStage(init, drawerConfig);
  const observer = new ResizeObserver(() => { stage.resize(); stage.render(); });
  const loader = new CaratLoader(attachments, curveDataChannel, inclinometryChannel);
  const lookupNames = stage.getActiveTrack().getLookupNames();

  return {
    canvas: undefined, stage, loader, observer,
    lookupNames, channelNames: [...usedChannels],
    loading: {percentage: 100, status: null},
  };
}

/** Возвращает настройки формы по состоянию формы. */
export function caratStateToSettings(id: FormID, {stage}: CaratState): CaratFormSettings {
  const settings = stage.getCaratSettings();
  const columns = stage.getActiveTrack().getInitColumns();
  const correlationSettings = stage.correlations.getInit();
  if (correlationSettings) columns.push(correlationSettings);
  return {id, settings, columns};
}
