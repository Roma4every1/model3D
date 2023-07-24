import { createColumnInfo } from 'entities/channels';

import {
  criterionProperties,
  styleCriterionProperties, labelCriterionProperties
} from './constants';


export function identifyCaratChannel(attachment: CaratAttachedChannel, channel: Channel) {
  attachment.properties = getAttachedProperties(attachment, channel);
  for (const channelType in criterionProperties) {
    const info = createColumnInfo(channel, criterionProperties[channelType]);
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
    attachment.curveColorLookup = colorProperty?.lookupChannels?.at(0);
  }
  else if (attachment.type === 'lithology' || attachment.type === 'perforations') {
    attachment.styles = [];
    for (const property of attachment.properties) {
      let styleChannel: ChannelName = null, styleInfo: CaratChannelInfo = null;
      let textChannel: ChannelName = null, textInfo: CaratChannelInfo = null;
      const lookups = property.lookupChannels.map((channelName) => dict[channelName]);

      for (const lookup of lookups) {
        if (!styleInfo) {
          styleInfo = createColumnInfo(lookup, styleCriterionProperties);
          if (styleInfo) styleChannel = lookup.name;
        }
        if (!textInfo) {
          textInfo = createColumnInfo(lookup, labelCriterionProperties);
          if (textInfo) textChannel = lookup.name;
        }
      }
      if (styleChannel || textChannel) attachment.styles.push({
        columnName: property.fromColumn, columnIndex: -1,
        color: {name: styleChannel, info: styleInfo, applied: false, dict: {}},
        text: {name: textChannel, info: textInfo, applied: false, dict: {}},
      });
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

export function applyInfoIndexes(attachment: CaratAttachedChannel | CaratAttachedLookup, columns: ChannelColumn[]) {
  for (const field in attachment.info) {
    const propertyInfo = attachment.info[field];
    for (let i = 0; i < columns.length; i++) {
      const name = columns[i].Name;
      if (propertyInfo.name === name) { propertyInfo.index = i; break; }
    }
  }
  attachment.applied = true;
}

export function createInfoRecord<Fields extends string>(row: ChannelRow, info: CaratChannelInfo<Fields>) {
  const cells = row.Cells;
  const record: Record<Fields, any> = {} as any;

  for (const field in info) {
    const index = info[field].index;
    record[field] = cells[index];
  }
  return record;
}
