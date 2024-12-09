import { updateParamDeep } from 'entities/parameter';
import { MapStage } from './map-stage';
import { MapLoader } from '../loader/loader';
import { mapPluginDict } from './plugins';
import { wellMapConfig } from '../extra-objects/well';
import { traceMapConfig } from '../extra-objects/trace';


export class MapStateFactory {
  private readonly id: FormID;
  private readonly objects: ObjectsState;

  public static create(id: FormID, payload: FormStatePayload): MapState {
    const factory = new MapStateFactory(id, payload.objects);
    return factory.create(true, payload);
  }

  public static createForMultiMap(loaderFormID: FormID, objects: ObjectsState): MapState {
    const factory = new MapStateFactory(loaderFormID, objects);
    return factory.create(false);
  }

  constructor(id: FormID, objects: ObjectsState) {
    this.id = id;
    this.objects = objects;
  }

  private create(editable: boolean, payload?: FormStatePayload): MapState {
    const stage = this.createStage(payload);
    const observer = new ResizeObserver(() => { stage.resize(); });

    const inclPlugin = stage.getPlugin('incl');
    if (inclPlugin) inclPlugin.onParameterUpdate = (v) => updateParamDeep(inclPlugin.parameterID, v);

    return {
      stage, loader: new MapLoader(this.id), observer,
      canvas: null, status: 'empty', owner: null, mapID: null, modified: false,
      editable, propertyWindowOpen: false, attrTableWindowOpen: false,
    };
  }

  private createStage(payload?: FormStatePayload): MapStage {
    const plugins: IMapPlugin[] = [];
    if (payload) {
      const settings: Record<string, any> = payload.state.settings ?? {};
      const parentParameters = payload.parameters[payload.state.parent];
      const channels = payload.state.channels;

      for (const pluginName in settings) {
        const Plugin = mapPluginDict[pluginName];
        if (Plugin) plugins.push(new Plugin(settings[pluginName], parentParameters, channels));
      }
    }

    const stage = new MapStage(plugins);
    if (this.objects.well.activated()) stage.registerExtraObject(wellMapConfig);
    if (this.objects.trace.activated()) stage.registerExtraObject(traceMapConfig);
    return stage;
  }
}
