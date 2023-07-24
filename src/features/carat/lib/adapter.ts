import { CaratStage } from '../rendering/stage';
import { CaratLoader } from './loader';
import { createColumnInfo } from 'entities/channels';
import { identifyCaratChannel, applyStyle } from './channels';
import { drawerConfig, criterionProperties, inclinometryDataProperties } from './constants';


/** Создаёт состояние каротажа по её начальным настройкам. */
export function settingsToCaratState(payload: FormStatePayload): CaratState {
  const { state: formState, channels: channelDict } = payload;
  const init: CaratFormSettings = formState.settings;
  init.columns.sort((a, b) => a.settings.index - b.settings.index);

  let curveDataChannel: CaratAttachedChannel;
  const usedChannels = new Set<ChannelName>();
  const attachments: CaratAttachedChannel[] = [];

  for (const column of init.columns) {
    for (const attachedChannel of column.channels) {
      const channel = channelDict[attachedChannel.name];
      identifyCaratChannel(attachedChannel, channel);

      if (attachedChannel.type === 'curve-data') {
        curveDataChannel = attachedChannel;
      } if (attachedChannel.type === 'inclinometry') {
        const propertyName = criterionProperties.inclinometry.inclinometry;
        const property = channel.info.properties.find(p => p.name === propertyName);
        const inclinometryChannel = property?.secondLevelChannelName;

        if (inclinometryChannel) {
          const info = createColumnInfo(channelDict[inclinometryChannel], inclinometryDataProperties);
          attachedChannel.inclinometry = {name: inclinometryChannel, info, dict: null};
          usedChannels.add(inclinometryChannel);
          attachments.push(attachedChannel.inclinometry as any);
        }
        delete attachedChannel.type;
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

  const track = stage.getActiveTrack();
  const activeGroup = track.getActiveGroup();
  const lookupNames = track.getLookupNames();

  formState.channels = [...usedChannels];
  const loader = new CaratLoader(attachments, curveDataChannel);

  const curveGroup = activeGroup?.hasCurveColumn()
    ? activeGroup
    : track.getGroups().find((group) => group.hasCurveColumn());

  return {
    canvas: undefined, stage, loader, observer,
    activeGroup, curveGroup, activeCurve: null,
    lookupNames, loading: false,
  };
}

/** Возвращает настройки формы по состоянию формы. */
export function caratStateToSettings(id: FormID, state: CaratState): CaratFormSettings {
  const settings = state.stage.getCaratSettings();
  const columns = state.stage.getActiveTrack().getInitColumns();
  columns.push(state.stage.correlationInit);
  return {id, settings, columns};
}
