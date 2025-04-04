import type { ObjectsState } from 'entities/objects';
import type { MapState, MapEditState } from './types';
import { MapStage } from './map-stage';
import { MapLoader } from '../loader/loader';
import * as modes from '../modes';
import * as extra from '../extra-objects';


export class MapStateFactory {
  private readonly id: FormID;
  private readonly loaderFormID: FormID;
  private readonly objects: ObjectsState;

  private payload: FormStatePayload | undefined;
  private usedChannels: ChannelID[];
  private usedParameters: Record<string, ParameterID>;

  public static create(id: FormID, payload: FormStatePayload): MapState {
    const factory = new MapStateFactory(id, id, payload.objects);
    return factory.create(true, payload);
  }

  public static createForMultiMap(id: FormID, loaderFormID: FormID, objects: ObjectsState): MapState {
    const factory = new MapStateFactory(id, loaderFormID, objects);
    return factory.create(false);
  }

  private constructor(id: FormID, loaderFormID: FormID, objects: ObjectsState) {
    this.id = id;
    this.loaderFormID = loaderFormID;
    this.objects = objects;
  }

  private create(editable: boolean, payload?: FormStatePayload): MapState {
    this.payload = payload;
    this.usedChannels = [];
    this.usedParameters = {};

    if (payload) {
      const mapChannel = payload.state.channels.find(c => c.type === 'maps');
      if (mapChannel) this.usedChannels.push(mapChannel.id);
    }
    const stage = this.createStage(editable);
    const resizeObserver = new ResizeObserver(() => { stage.resize(); });

    const edit: MapEditState = editable ? {
      editing: false, creating: false, modified: false,
      propertyWindowOpen: false, attrTableWindowOpen: false
    } : null;

    return {
      id: this.id, stage, loader: new MapLoader(this.loaderFormID), observer: resizeObserver,
      usedChannels: this.usedChannels, usedParameters: this.usedParameters,
      canvas: null, status: 'empty', owner: null, mapID: null, edit,
    };
  }

  private createStage(editable: boolean): MapStage {
    const hasWell = this.objects.well.activated();
    const hasTrace = this.objects.trace.activated();
    const hasSite = this.objects.site.activated();
    const hasSelection = this.objects.selection.activated();

    const stage = new MapStage();
    stage.registerMode(new modes.DefaultModeProvider(hasWell));
    stage.registerMode(new modes.ElementSelectModeProvider());

    stage.registerMode(new modes.MeasureModeProvider());
    stage.registerExtraObject('measure', extra.createMeasureConfig());
    stage.registerMode(new modes.FieldValueModeProvider(stage));
    stage.registerExtraObject('field-value', extra.createFieldValueConfig());

    this.checkInclinometryPlugin(stage);

    if (hasWell) {
      stage.registerExtraObject('well', extra.createMapWellConfig(stage));
    }
    if (hasTrace) {
      stage.registerExtraObject('trace', extra.createMapTraceConfig());
      stage.registerMode(new modes.TraceEditModeProvider());
    }
    if (hasSite) {
      stage.registerExtraObject('site', extra.createMapSiteConfig(stage));
      stage.registerMode(new modes.SiteMovePointModeProvider());
      stage.registerMode(new modes.SiteAppendPointModeProvider());
      stage.registerMode(new modes.SiteInsertPointModeProvider());
      stage.registerMode(new modes.SiteRemovePointModeProvider());
    }
    if (hasSelection) {
      stage.registerExtraObject('selection', extra.createMapSelectionConfig(stage));
      stage.registerMode(new modes.SelectionEditModeProvider());
    }
    if (editable) {
      stage.registerMode(new modes.ElementDragModeProvider());
      stage.registerMode(new modes.ElementRotateModeProvider());
      stage.registerMode(new modes.ElementCreateModeProvider(this.id));
      stage.registerMode(new modes.LineMovePointModeProvider());
      stage.registerMode(new modes.LineAppendPointModeProvider());
      stage.registerMode(new modes.LineInsertPointModeProvider());
      stage.registerMode(new modes.LineRemovePointModeProvider());
    }
    return stage;
  }

  private checkInclinometryPlugin(stage: MapStage): void {
    const plugin = this.payload?.state.settings.wellsLinkedClients;
    if (!plugin || plugin['@InclinometryModeOn'] !== 'true') return;

    const channels = this.payload.state.channels;
    const dataChannel = channels.find(c => c.type === 'incl-data');
    const propChannel = channels.find(c => c.type === 'incl-props');
    if (!dataChannel || !propChannel) return;

    const parameters = this.payload.parameters[this.payload.state.parent];
    const p = parameters.find(p => p.name === 'inclinometryViewAngle');
    if (!p || p.type !== 'double') return;
    this.usedParameters.incl = p.id;
    this.usedChannels.push(dataChannel.id, dataChannel.info.version.lookups.ids.id, propChannel.id);

    const radius = Number(plugin['@MinCircle']) / 2;
    const config = extra.createMapInclConfig(stage, {dataChannel, propChannel, radius});

    stage.registerExtraObject('incl', config);
    stage.registerMode(new modes.InclinometryModeProvider(p.id));
    stage.setMode('incl');
  }
}
