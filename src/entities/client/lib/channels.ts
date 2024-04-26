import { RecordInfoCreator } from 'entities/channel';


export function crateAttachedChannel(init: AttachedChannelDTO, channel: Channel): AttachedChannel {
  const channels = {[channel.name]: channel};
  return new AttachedChannelFactory(channels).createModels([init])[0];
}

export class AttachedChannelFactory {
  /** Все каналы, доступные клиенту. */
  private readonly channels: ChannelDict;
  /** Критерии каналов для задания типов. */
  private readonly criteria: ClientChannelCriteria;
  /** Все каналы, доступные клиенту. */
  private readonly creator: RecordInfoCreator;

  constructor(channels: ChannelDict, criteria?: ClientChannelCriteria) {
    this.channels = channels;
    this.criteria = criteria;
    this.creator = new RecordInfoCreator(channels);
  }

  public createModels(init: AttachedChannelDTO[]): AttachedChannel[] {
    return init.map(dto => this.createModel(dto)).filter(Boolean);
  }

  private createModel(dto: AttachedChannelDTO): AttachedChannel | undefined {
    const channel = this.channels[dto.name];
    if (!channel) return;

    const attachedProperties = getAttachedProperties(dto, channel.config.properties);
    const attachedChannel: AttachedChannel = {name: dto.name, attachedProperties};
    if (!this.criteria) return attachedChannel;

    for (const channelType in this.criteria) {
      const info = this.creator.create(channel, this.criteria[channelType]);
      if (!info) continue;

      attachedChannel.info = info;
      attachedChannel.type = channelType;
      return attachedChannel;
    }
  }
}

/** Определяем множество подключённых свойств. */
function getAttachedProperties(dto: AttachedChannelDTO, all: ChannelProperty[]): ChannelProperty[] {
  const attachOption = dto.attachOption ?? 'all';
  const exclude = (dto.exclude ?? []).map(name => name.toUpperCase());

  const checker = attachOption === 'AttachAll' || attachOption === 'all'
    ? (property: ChannelProperty): boolean => !exclude.includes(property.name)
    : (property: ChannelProperty): boolean => exclude.includes(property.name);
  return all.filter(checker);
}
