import { cellsToRecords, createColumnInfo } from 'entities/channels';

import {
  caratChannelCriterionDict, curveColorCriterion,
  lithologyStyleCriterion, lithologyLabelCriterion
} from './constants';


export function identifyCaratChannel(attachment: CaratAttachedChannel, channel: Channel) {
  attachment.properties = getAttachedProperties(attachment, channel);
  for (const channelType in caratChannelCriterionDict) {
    const info = createColumnInfo(channel, caratChannelCriterionDict[channelType]);
    if (info) {
      attachment.type = channelType as CaratChannelType;
      attachment.info = info as any;
      break;
    }
  }
}

export function applyStyle(
  attachment: CaratAttachedChannel, properties: CaratColumnProperties,
  channel: Channel, dict: ChannelDict,
) {
  if (attachment.type === 'curve-set') {
    const colorPropertyName = attachment.info.type.name;
    const colorProperty = channel.info.properties.find(p => p.fromColumn === colorPropertyName);
    const lookupName = colorProperty?.lookupChannels?.at(0);
    const info = createColumnInfo(dict[lookupName], curveColorCriterion);
    if (info) attachment.curveColorLookup = {name: lookupName, info, dict: null};
  }
  else if (['lithology', 'perforations', 'face'].includes(attachment.type)) {
    attachment.styles = [];
    for (const property of attachment.properties) {
      let styleChannel: ChannelName = null, styleInfo: CaratChannelInfo = null;
      let textChannel: ChannelName = null, textInfo: CaratChannelInfo = null;
      const lookups = property.lookupChannels.map((channelName) => dict[channelName]);

      for (const lookup of lookups) {
        if (!styleInfo) {
          styleInfo = createColumnInfo(lookup, lithologyStyleCriterion);
          if (styleInfo) styleChannel = lookup.name;
        }
        if (!textInfo) {
          textInfo = createColumnInfo(lookup, lithologyLabelCriterion);
          if (textInfo) textChannel = lookup.name;
        }
      }
      if (styleChannel || textChannel) attachment.styles.push({
        columnName: property.fromColumn,
        color: {name: styleChannel, info: styleInfo, dict: {}},
        text: {name: textChannel, info: textInfo, dict: {}},
      });
    }
    for (const property of channel.info.properties) {
      if (property.name === caratChannelCriterionDict.lithology.stratumID) {
        attachment.namesChannel = property.lookupChannels[0];
      }
    }

    const barProperty = attachment.properties.find(p => properties[p.name]?.showBar);
    if (barProperty) attachment.info.bar = {name: barProperty.fromColumn, index: -1};
  }
}

function getAttachedProperties(attachment: CaratAttachedChannel, channel: Channel) {
  const allProperties = channel.info.properties;
  const { attachOption, exclude } = attachment;

  const checker = attachOption === 'AttachAll'
    ? (property) => !exclude.includes(property.name)
    : (property) => exclude.includes(property.name);
  return allProperties.filter(checker);
}

export function channelDictToRecords(dict: ChannelDict): ChannelRecordDict {
  const result: ChannelRecordDict = {};
  for (const channelName in dict) {
    result[channelName] = cellsToRecords(dict[channelName]?.data);
  }
  return result;
}
