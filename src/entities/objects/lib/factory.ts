import type { ObjectsState } from '../store/objects.store';
import { PlaceManager } from './place';
import { WellManager } from './well';
import { StratumManager } from './stratum';
import { TraceManager } from './trace';
import { SelectionManager } from './selection';
import { SiteManager } from './site';


/** Данные плагинов активных объектов в конфигурации системы. */
export interface ObjectPluginsDTO {
  /** Настройки менеджера трасс.  */
  tracesManager?: {channelName?: string | null};
  /** Настройки менеджера выборок.  */
  setsManager?: {channelName?: string | null};
  /** Настройки менеджера участков.  */
  sitesManager?: {channelName?: string | null};
}


export class ObjectsFactory {
  private readonly parameters: Parameter[];
  private readonly channels: ChannelDict;

  constructor(parameters: Parameter[], channels: ChannelDict) {
    this.parameters = parameters;
    this.channels = channels;
  }

  public createState(dto: ObjectPluginsDTO): ObjectsState {
    const placeManager = new PlaceManager(this.parameters, this.channels);
    const stratumManager = new StratumManager(this.parameters, this.channels);
    const wellManager = new WellManager(this.parameters, this.channels);
    const { tracesManager, setsManager, sitesManager } = dto;

    const traceChannel = tracesManager ? (tracesManager.channelName || 'traces') : null;
    const traceManager = new TraceManager(traceChannel, this.channels, wellManager.channelID);

    const selectionChannel = setsManager ? (setsManager.channelName || 'sets') : null;
    const selectionManager = new SelectionManager(selectionChannel, this.channels);

    const siteChannel = sitesManager ? (sitesManager.channelName || 'sites') : null;
    const siteManager = new SiteManager(siteChannel, this.channels);

    return {
      place: placeManager, stratum: stratumManager,
      well: wellManager, trace: traceManager,
      selection: selectionManager, site: siteManager,
    };
  }
}
