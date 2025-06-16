import type { CaratColumnInit } from '../lib/dto.types';
import { CaratDrawer } from './drawer';

import { CaratColumn } from './base-column';
import { CaratMarkColumn } from './mark-column';
import { CaratImageColumn } from './image-column';
import { WellBoreColumn } from './well-bore-column';
import { WellFaceColumn } from './face-column';
import { VerticalLineColumn } from './v-line-column';


export class CaratColumnFactory {
  private readonly drawer: CaratDrawer;
  private readonly init: CaratColumnInit;

  constructor(drawer: CaratDrawer, init: CaratColumnInit) {
    this.drawer = drawer;
    this.init = init;
  }

  public createColumn(channel: AttachedChannel<CaratChannelType>, rect: Rectangle): ICaratColumn {
    const channelType = channel.type;
    const properties = this.init.properties[channel.name] ?? {};

    if (channelType === 'bore') {
      return new WellBoreColumn(rect, this.drawer, channel, properties);
    } else if (channelType === 'image') {
      return new CaratImageColumn(rect, this.drawer, channel);
    } else if (channelType === 'face') {
      return new WellFaceColumn(rect, this.drawer, channel);
    } else if (channelType === 'vertical') {
      return new VerticalLineColumn(rect, this.drawer, channel, properties);
    } else if (channelType === 'mark') {
      return new CaratMarkColumn(rect, this.drawer, channel, this.init.marks);
    } else {
      return new CaratColumn(rect, this.drawer, channel, properties);
    }
  }
}

/** z-index для каротажных колонок: чем больше число, тем выше элементы колонки. */
const zIndexDict: Record<Exclude<CaratChannelType, 'curve-data' | 'inclinometry'>, number> = {
  'mark': 32,
  'image': 31,
  'curve': 22,
  'face': 21,
  'vertical': 12,
  'bore': 11,
  'lithology': 1,
  'perforation': 1,
  'flow': 1,
  'interval': 1,
};

/** Функция сортировки каротажных колонок в рамках одной группы. */
export function caratColumnCompareFn(a: ICaratColumn, b: ICaratColumn): number {
  const aSortIndex = zIndexDict[a.channel.type];
  const bSortIndex = zIndexDict[b.channel.type];
  return aSortIndex - bSortIndex;
}
