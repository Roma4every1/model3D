import { ObjectsState } from "entities/objects";
import { ModelState } from "../model";
import { ModelLoader } from "./loader";
import { ModelStage } from "./model-stage";

export class ModelStateFactory {
  private readonly id: FormID;
  private readonly loaderFormID: FormID;
  private readonly objects: ObjectsState;

  private payload: FormStatePayload | undefined;
  private usedChannels: ChannelID[];
  private usedParameters: Record<string, ParameterID>;

  public static create(id: FormID, payload: FormStatePayload): ModelState {
    const factory = new ModelStateFactory(id, id, payload.objects);
    return factory.create(true, payload);
  }


  private constructor(id: FormID, loaderFormID: FormID, objects: ObjectsState) {
    this.id = id;
    this.loaderFormID = loaderFormID;
    this.objects = objects;
  }

  private create(editable: boolean, payload?: FormStatePayload): ModelState {
    this.payload = payload;
    this.usedChannels = [];
    this.usedParameters = {};

    if (payload) {
      const modelChannels = payload.state.channels.filter(c => c.name.includes('Model')).map(c => c.id);      
      if (modelChannels) this.usedChannels = [...this.usedChannels, ...modelChannels];
    }
    const stage = new ModelStage();
    const resizeObserver = new ResizeObserver(() => { stage.handleResize(); });
    // const stage = this.createStage(editable);
    // const resizeObserver = new ResizeObserver(() => { stage.resize(); });

    // const edit: ModelEditState = editable ? {
    //   editing: false, creating: false, modified: false,
    //   propertyWindowOpen: false, attrTableWindowOpen: false
    // } : null;

    return {
      id: this.id, stage, loader: new ModelLoader(this.loaderFormID),
      usedChannels: this.usedChannels, geomFiles: null, 
      status: 'empty', zoneId: null, modelId: null, parsedModel: null,
      parameters:null, canvas: null, observer: resizeObserver
    };
  }}