import { criterionProperties, styleCriterionProperties } from './constants';


export function identifyCaratChannel(attachment: CaratAttachedChannel, channel: Channel) {
  attachment.properties = getAttachedProperties(attachment, channel);
  for (const channelType in criterionProperties) {
    const info = createInfo(channel, criterionProperties[channelType]);
    if (info) {
      attachment.type = channelType as CaratChannelType;
      attachment.info = info as any;
      attachment.applied = false;
      break;
    }
  }
}

export function applyStyle(attachment: CaratAttachedChannel, channel: Channel, dict: ChannelDict) {
  if (attachment.type === 'curve-set') {
    const colorPropertyName = attachment.info.type.name;
    const colorProperty = channel.info.properties.find(p => p.fromColumn === colorPropertyName);
    const curveColorChannel = colorProperty?.lookupChannels?.at(0);
    if (curveColorChannel) attachment.style = {name: curveColorChannel, info: null};
  }
  else if (attachment.type === 'lithology' || attachment.type === 'perforations') {
    // смотрим на подключённые свойства и на их справочники, если подключено
    // более 2 свойств, смотрим на первое, свойства должно быть подключено
    // 2 справочника, один для цветов, второй для подписей
    for (const property of attachment.properties) {
      for (const lookupChannelName of property.lookupChannels) {
        const lookup = dict[lookupChannelName];
        const info = createInfo(lookup, styleCriterionProperties)

        if (info) {
          attachment.style = {name: lookupChannelName, info};
          attachment.info.style = {name: property.fromColumn, index: -1};
          break;
        }
      }
    }
    for (const property of channel.info.properties) {
      if (property.name === criterionProperties.lithology.stratumID) {
        attachment.namesChannel = property.lookupChannels[0];
      }
    }
  }
}

export function getAttachedProperties(attachment: CaratAttachedChannel, channel: Channel) {
  const allProperties = channel.info.properties;
  const { attachOption, exclude } = attachment;

  const checker = attachOption === 'AttachAll'
    ? (property) => !exclude.includes(property.name)
    : (property) => exclude.includes(property.name);
  return allProperties.filter(checker);
}

export function createInfo(channel: Channel, criterion: Record<string, string>): CaratChannelInfo {
  const properties = channel.info.properties;
  const propertyNames = properties.map((property) => property.name.toUpperCase());

  const info: CaratChannelInfo = {};
  for (const field in criterion) {
    const criterionName = criterion[field];
    const index = propertyNames.findIndex((name) => name === criterionName);

    if (index === -1) return null;
    info[field] = {name: properties[index].fromColumn, index: -1};
  }
  return info;
}

export function applyInfoIndexes(attachment: CaratAttachedChannel | CaratAttachedStyle, columns: ChannelColumn[]) {
  for (const field in attachment.info) {
    const propertyInfo = attachment.info[field];
    for (let i = 0; i < columns.length; i++) {
      const name = columns[i].Name;
      if (propertyInfo.name === name) { propertyInfo.index = i; break; }
    }
  }
  attachment.applied = true;
}
