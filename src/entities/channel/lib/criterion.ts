import { testString } from 'shared/lib';


export class RecordInfoCreator {
  constructor(private readonly channels: ChannelDict) {}

  public create(channel: Channel, criterion: ChannelCriterion): ChannelRecordInfo {
    const nameMatcher = criterion.name;
    if (nameMatcher && !testString(channel.name, nameMatcher)) return;

    const info: ChannelRecordInfo = {};
    const properties = channel.config.properties;

    for (const field in criterion.properties) {
      const propertyCriterion = criterion.properties[field];
      let matched = false;

      for (const property of properties) {
        const propertyInfo = this.createPropertyInfo(property, propertyCriterion);
        if (!propertyInfo) continue;
        info[field] = propertyInfo;
        matched = true; break;
      }
      if (!matched && propertyCriterion.required !== false) return;
    }
    return info;
  }

  private createPropertyInfo(p: ChannelProperty, c: ChannelPropertyCriterion): RecordPropertyInfo {
    const { name, fromColumn, file } = p;
    const nameMatcher = c.name;
    if (nameMatcher && !testString(name, nameMatcher)) return;
    if (c.binary && !file) return;

    const info: RecordPropertyInfo = {propertyName: name, columnName: fromColumn};
    if (c.lookups) {
      const lookupInfo = this.createPropertyLookups(p, c.lookups);
      if (!lookupInfo) return;
      info.lookups = lookupInfo;
    }
    if (c.details) {
      const required = c.details.required !== false;
      const channel = this.channels[p.detailChannel];
      if (!channel && required) return;
      const details = this.create(channel, c.details);
      if (!details && required) return;
      info.details = {name: channel.name, info: details};
    }
    return info;
  }

  private createPropertyLookups(p: ChannelProperty, l: PropertyLookupCriteria): RecordLookupInfo {
    const info: RecordLookupInfo = {};
    for (const lookupName in l) {
      const criterion = l[lookupName];
      let matched = false;

      for (const channelName of p.lookupChannels) {
        const channel = this.channels[channelName];
        if (!channel) continue;
        const lookupInfo = this.create(channel, criterion);
        if (!lookupInfo) continue;

        info[lookupName] = {name: channel.name, info: lookupInfo};
        matched = true; break;
      }
      if (!matched && criterion.required !== false) return;
    }
    return info;
  }
}
