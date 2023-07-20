import { CaratStage } from '../rendering/stage';
import { CaratTraceLoader } from './trace-loader';
import { identifyCaratChannel, applyStyle, createInfo } from './channels';
import { drawerConfig, criterionProperties, inclinometryDataProperties } from './constants';


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
      } if (attachedChannel.type === 'inclinometry') {
        const propertyName = criterionProperties.inclinometry.inclinometry;
        const property = channel.info.properties.find(p => p.name === propertyName);
        const inclinometryChannel = property?.secondLevelChannelName;

        if (inclinometryChannel) {
          const info = createInfo(channelDict[inclinometryChannel], inclinometryDataProperties);
          attachedChannel.inclinometry = {name: inclinometryChannel, info, applied: false, dict: null};
          if (!channels.includes(inclinometryChannel)) channels.push(inclinometryChannel);
        } else {
          delete attachedChannel.type;
        }
      } else {
        applyStyle(attachedChannel, channel, channelDict);
      }
    }
  }

  const lookupNames: ChannelName[] = [];
  for (const name of channels) lookupNames.push(...channelDict[name].info.lookupChannels);

  const stage = new CaratStage(init, drawerConfig);
  const traceLoader = new CaratTraceLoader(formState.id);
  const observer = new ResizeObserver(() => { stage.resize(); stage.render(); });

  const track = stage.getActiveTrack();
  const activeGroup = track.getActiveGroup();

  const curveGroup = activeGroup?.hasCurveColumn()
    ? activeGroup
    : track.getGroups().find((group) => group.hasCurveColumn());

  return {
    canvas: undefined, stage, traceLoader, observer,
    activeGroup, curveGroup, activeCurve: null,
    lookupNames, lastData: [],
  };
}

/** Возвращает настройки формы по состоянию формы. */
export function caratStateToSettings(id: FormID, state: CaratState): CaratFormSettings {
  const settings = state.stage.getCaratSettings();
  const columns = state.stage.getActiveTrack().getInitColumns();
  columns.push(state.stage.correlationInit);
  return {id, settings, columns};
}
