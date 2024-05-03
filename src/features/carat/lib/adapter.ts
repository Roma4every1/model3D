import type { CaratState } from '../store/carat.store';
import type { CaratFormSettings, CaratColumnInit, CaratColumnDTO } from './dto.types';
import { RecordInfoCreator } from 'entities/channel';
import { CaratStage } from '../rendering/stage';
import { CaratLoader } from './loader';
import { drawerConfig } from './constants';
import { CaratStyleLookup } from './interval-style';
import { rectStyle } from './channel-criteria';
import { setCaratLoading } from '../store/carat.actions';


/** Создаёт состояние каротажа по её начальным настройкам. */
export function settingsToCaratState(payload: FormStatePayload<CaratFormSettings>): CaratState {
  const { id, channels: attachedChannels } = payload.state;
  const { settings: caratSettings, columns: initColumns } = payload.settings;

  const usedChannels: Set<ChannelName> = new Set();
  const columns = initColumns.map(c => dtoToInit(c, attachedChannels)).sort(columnCompareFn);

  for (const attachedChannel of attachedChannels) {
    const type = attachedChannel.type as CaratChannelType;
    if (type === 'lithology' || type === 'perforation' || type === 'face') {
      applyStyle(attachedChannel, payload.channels);
    }
    if (type !== 'curve-data') {
      usedChannels.add(attachedChannel.name);
    }
  }

  const stage = new CaratStage(caratSettings, columns, drawerConfig);
  const observer = new ResizeObserver(() => { stage.resize(); stage.render(); });

  const loader = new CaratLoader(attachedChannels);
  loader.onProgressChange = (loading: Partial<CaratLoading>) => setCaratLoading(id, loading);

  return {
    canvas: undefined, stage, loader, observer,
    channelNames: [...usedChannels],
    lookupNames: stage.getActiveTrack().getLookupNames(),
    loading: {percentage: 100, status: null},
  };
}

function applyStyle(attachment: AttachedChannel, channels: ChannelDict): void {
  const styles: CaratStyleLookup[] = [];
  const creator = new RecordInfoCreator(channels);

  for (const { fromColumn, lookupChannels } of attachment.attachedProperties) {
    for (const channelName of lookupChannels) {
      const info = creator.create(channels[channelName], rectStyle);
      if (info) { styles.push({columnName: fromColumn, channelName, info}); break; }
    }
  }
  attachment.config = styles;
}

function dtoToInit(dto: CaratColumnDTO, attachments: AttachedChannel[]): CaratColumnInit {
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

function columnCompareFn(a: CaratColumnInit, b: CaratColumnInit): number {
  const aIndex = a.settings.index ?? Number.MAX_SAFE_INTEGER;
  const bIndex = b.settings.index ?? Number.MAX_SAFE_INTEGER;
  return aIndex - bIndex;
}

/** Возвращает настройки формы по состоянию каротажа. */
export function caratStateToSettings(id: FormID, state: CaratState): CaratFormSettings {
  const settings = state.stage.getInitSettings();
  return {id, ...settings};
}
