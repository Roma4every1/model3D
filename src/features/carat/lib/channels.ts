import { CaratElementCurve, CaratElementInterval } from './types';
import { criterionProperties } from './constants';
import { channelsAPI } from '../../../entities/channels/lib/channels.api';


export function identifyCaratChannel(attachment: CaratAttachedChannel, channel: Channel) {
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

export function applyInfoIndexes(attachment: CaratAttachedChannel, columns: ChannelColumn[]) {
  for (const field in attachment.info) {
    const propertyInfo = attachment.info[field];
    for (let i = 0; i < columns.length; i++) {
      const name = columns[i].Name;
      if (propertyInfo.name === name) { propertyInfo.index = i; break; }
    }
  }
  attachment.applied = true;
}

/* --- Elements Creation --- */

export function createCaratIntervals(rows: ChannelRow[], info: CaratLithologyInfo) {
  const topIndex = info.top.index;
  const baseIndex = info.base.index;

  return rows.map((row): CaratElementInterval => {
    const cells = row.Cells;
    return {top: cells[topIndex], base: cells[baseIndex], style: null};
  });
}

export function createCaratCurves(rows: ChannelRow[], info: CaratCurveDataInfo): CaratElementCurve[] {
  const dataIndex = info.data.index;
  const topIndex = info.top.index;
  const leftIndex = info.left.index;

  return rows.map((row) => {
    const cells = row.Cells;
    const top = cells[topIndex], left = cells[leftIndex];

    const source = window.atob(cells[dataIndex]);
    const path = new Path2D(source);
    return {top, left, path, style: null};
  });
}

export async function loadCaratCurves(name: ChannelName, ids: string[]): Promise<ChannelData> {
  const parameter: Parameter = {id: 'currentCurveIds', type: 'stringArray', value: ids} as Parameter;
  const res = await channelsAPI.getChannelData(name, [parameter], {order: []} as any);
  return res.ok ? res.data.data : null;
}
