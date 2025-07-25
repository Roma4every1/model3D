import type { CaratState } from '../store/carat.store';
import type { CaratFormSettings, CaratGlobalSettingsDTO, CaratColumnInit, CaratColumnDTO } from './dto.types';
import { XElement } from 'shared/lib';
import { RecordInfoCreator } from 'entities/channel';
import { CaratStage } from '../rendering/stage';
import { CaratLoader } from './loader';
import { drawerConfig } from './constants';
import { CaratStyleLookup } from './interval-style';
import { rectStyle } from './channel-criteria';
import { setCaratLoading } from '../store/carat.actions';


/** Создаёт состояние каротажа по её начальным настройкам. */
export function settingsToCaratState(payload: FormStatePayload<CaratFormSettings>): CaratState {
  const { id, channels: attachedChannels, extra } = payload.state;
  const { settings: caratSettings, columns: initColumns } = payload.state.settings;

  let separateCurveLoading = false;
  const channels = payload.channels;
  const usedChannels: Set<ChannelID> = new Set();

  const toInit = (c: CaratColumnDTO, i: number) => dtoToInit(c, i, attachedChannels);
  const columns = initColumns.sort(columnCompareFn).map(toInit);

  for (const attachedChannel of attachedChannels) {
    const id = attachedChannel.id;
    const channel = channels[id];
    attachedChannel.config = {displayName: channel.config.displayName ?? channel.name};

    const type = attachedChannel.type as CaratChannelType;
    if (type === 'lithology' || type === 'perforation' || type === 'face' || type === 'interval') {
      applyStyle(attachedChannel, channels);
    }
    if (type === 'curve-data') {
      const parameterNames = channel.config.parameterNames;
      if (parameterNames.length === 1 && parameterNames[0] === 'currentCurveIds') {
        separateCurveLoading = true;
        continue;
      }
    }
    usedChannels.add(id);
  }

  const stage = createCaratStage(caratSettings, columns, extra);
  const observer = new ResizeObserver(() => { stage.resize(); stage.render(); });

  const loader = new CaratLoader(attachedChannels, separateCurveLoading);
  loader.onProgressChange = (loading: Partial<CaratLoading>) => setCaratLoading(id, loading);

  return {
    canvas: undefined, stage, loader, observer,
    channels: [...usedChannels],
    lookups: stage.getActiveTrack().getLookups(),
    loading: {percentage: 100, status: 'base.no-data'},
  };
}

function createCaratStage(settings: CaratGlobalSettingsDTO, columns: CaratColumnInit[], extra?: XElement): CaratStage {
  const { scale, zones, strataChannelName } = settings;
  const hideEmpty = extra?.getBooleanAttribute('hideEmpty') ?? true;

  const awElement = extra?.getChild('autoWidth');
  const minZoneWidth = awElement?.getNumberAttribute('minZoneWidth') || 50;
  const maxZoneWidth = awElement?.getNumberAttribute('maxZoneWidth') || 250;
  const autoWidth = awElement?.getBooleanAttribute('enabled') ?? true;

  const globalSettings = {strataChannelName, minZoneWidth, maxZoneWidth, autoWidth, hideEmpty};
  return new CaratStage({columns, scale, zones, globalSettings}, drawerConfig);
}

function applyStyle(attachment: AttachedChannel, channels: ChannelDict): void {
  const styles: CaratStyleLookup[] = [];
  const creator = new RecordInfoCreator(channels);

  for (const { fromColumn, lookupChannels } of attachment.attachedProperties) {
    for (const channelID of lookupChannels) {
      const info = creator.create(channels[channelID], rectStyle);
      if (info) { styles.push({columnName: fromColumn, channelID, info}); break; }
    }
  }
  attachment.config.styles = styles;
}

function dtoToInit(dto: CaratColumnDTO, i: number, attachments: AttachedChannel[]): CaratColumnInit {
  dto.settings.index = i;
  if (dto.settings.type === 'external') dto.channels = [];

  const channels = dto.channels ?? [];
  const resultChannels: AttachedChannel[] = [];

  for (const channel of channels) {
    const name = channel?.name;
    if (!name) continue;
    const attachedChannel = attachments.find(a => a.name === name);
    if (attachedChannel) resultChannels.push(attachedChannel);
  }
  return {...dto, channels: resultChannels as AttachedChannel<CaratChannelType>[]};
}

function columnCompareFn(a: CaratColumnDTO, b: CaratColumnDTO): number {
  const { type: aType, index: aIndex } = a.settings;
  const { type: bType, index: bIndex } = b.settings;
  if (aType === 'background' || aType === 'external') return 1;
  if (bType === 'background' || bType === 'external') return -1;
  return (aIndex ?? Number.MAX_SAFE_INTEGER) - (bIndex ?? Number.MAX_SAFE_INTEGER);
}
