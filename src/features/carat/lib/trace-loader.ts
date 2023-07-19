import { fillParamValues } from 'entities/parameters';
import { tableRowToString } from 'entities/parameters/lib/table-row';
import { channelsAPI } from 'entities/channels/lib/channels.api';


/** Класс, реализующий загрузку данных для построения каротажа по трассе. */
export class CaratTraceLoader implements ICaratTraceLoader {
  /** ID каротажной формы. */
  private readonly formID: FormID;

  /** Канал со скважинами. */
  private wellChannel: Channel;
  /** Каналы, зависимые от параметра скважины. */
  private wellDependentChannels: Channel[];

  private paramChannelDict: Record<ChannelName, Parameter[]>;
  /** Моковый параметер скважины. */
  private mockWellParameter: Parameter;

  constructor(id: FormID) {
    this.formID = id;
  }

  public async getCaratTraceData(state: WState, model: TraceModel): Promise<CaratTraceData> {
    const { parent: parentID, channels: channelNames } = state.forms[this.formID];
    const channels = channelNames.map(c => state.channels[c]);
    const wellParameterID = state.objects.well.parameterID;

    this.mockWellParameter = {...state.parameters[state.root.id].find(p => p.id === wellParameterID)};
    this.wellDependentChannels = channels.filter(c => c.info.parameters.includes(wellParameterID));
    this.wellChannel = state.channels[state.objects.well.channelName];

    this.paramChannelDict = {};
    const clients: FormID[] = [state.root.id, parentID, this.formID];

    for (const channel of this.wellDependentChannels) {
      const ids = channel.info.parameters.filter(pID => pID !== wellParameterID);
      this.paramChannelDict[channel.name] = fillParamValues(ids, state.parameters, clients);
    }

    const traceCaratData: CaratTraceData = {};
    for (const node of model.nodes) {
      traceCaratData[node.id] = await this.getNodeData(node);
    }
    return traceCaratData;
  }

  private async getNodeData(node: TraceNode): Promise<ChannelDataDict> {
    const dict: ChannelDataDict = {};

    const idIndex = this.wellChannel.info.lookupColumns.id.index;
    const row = this.wellChannel.data.rows.find(row => row.Cells[idIndex] === node.id);
    if (!row) return dict;

    const responses: Promise<Res<any>>[] = [];
    this.mockWellParameter.value = tableRowToString(this.wellChannel, row);

    for (const channel of this.wellDependentChannels) {
      const parameters = this.paramChannelDict[channel.name];
      parameters.push(this.mockWellParameter);
      responses.push(channelsAPI.getChannelData(channel.name, parameters, channel.query));
      parameters.pop();
    }

    const data = await Promise.all(responses);
    this.wellDependentChannels.forEach((channel, i) => {
      dict[channel.name] = data[i].data?.data ?? null;
    });
    return dict;
  }
}
