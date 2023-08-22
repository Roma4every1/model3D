import { CaratStage } from '../rendering/stage';
import { CaratLoader } from './loader';
import { createColumnInfo } from 'entities/channels';
import { identifyCaratChannel, applyStyle } from './channels';
import { drawerConfig, caratChannelCriterionDict, inclinometryCriterion } from './constants';


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
        const property = channel.info.properties.find(p => p.name === propertyName);
        const inclinometryDataChannel = property?.secondLevelChannelName;

        if (inclinometryDataChannel) {
          const n = attachedChannel.info.well.name;
          const p = channel.info.properties.find(p => p.fromColumn === n);
          if (!attachedChannel.properties.includes(p)) attachedChannel.properties.push(p);

          attachedChannel.inclinometry = {
            name: inclinometryDataChannel,
            info: createColumnInfo(channelDict[inclinometryDataChannel], inclinometryCriterion),
            dict: null,
          };

          inclinometryChannel = attachedChannel;
          usedChannels.add(attachedChannel.name);
          attachments.push(attachedChannel.inclinometry as any);
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

  const track = stage.getActiveTrack();
  const activeGroup = track.getActiveGroup();
  const lookupNames = track.getLookupNames();

  const curveGroup = activeGroup?.hasCurveColumn()
    ? activeGroup
    : track.getGroups().find((group) => group.hasCurveColumn());

  return {
    canvas: undefined, stage, loader, observer,
    activeGroup, curveGroup, activeCurve: null,
    lookupNames, channelNames: [...usedChannels], loading: false,
  };
}

/** Возвращает настройки формы по состоянию формы. */
export function caratStateToSettings(id: FormID, state: CaratState): CaratFormSettings {
  const settings = state.stage.getCaratSettings();
  const columns = state.stage.getActiveTrack().getInitColumns();
  columns.push(state.stage.correlations.getInit());
  return {id, settings, columns};
}
