import { fillParamValues } from 'entities/parameters';
import { tableRowToString } from 'entities/parameters/lib/table-row';
import { channelsAPI } from 'entities/channels/lib/channels.api';


/** Класс, реализующий загрузку данных для построения каротажа по трассе. */
export class CaratLoader implements ICaratLoader {
  /** ID каротажной формы. */
  private readonly formID: FormID;
  /** ID презентации с формой. */
  private readonly parentID: FormID;

  /** Названия каналов, необходимых для каждого трека. */
  private readonly wellDataChannelNames: ChannelName[];
  /** Название канала с точками привых. */
  private readonly curveDataChannelName: ChannelName;

  /** Флаг для преждевременной остановки загрузки. */
  private flag: number;
  /** Канал со скважинами. */
  private wellChannel: Channel;
  /** Каналы, зависимые от параметра скважины. */
  private wellDataChannels: Channel[];
  private paramChannelDict: Record<ChannelName, Parameter[]>;
  /** Моковый параметер скважины. */
  private mockWellParameter: Parameter;
  private data: ChannelDataDict;

  constructor(formState: FormState, curveChannel: ChannelName) {
    this.flag = 0;
    this.formID = formState.id;
    this.parentID = formState.parent;
    this.wellDataChannelNames = formState.channels;
    this.curveDataChannelName = curveChannel;
  }

  public getFlag(): number {
    return this.flag;
  }

  public async loadCurveData(ids: CaratCurveID[]): Promise<ChannelData> {
    const value = ids.map(String);
    const parameters = [{id: 'currentCurveIds', type: 'stringArray', value} as Parameter];
    const query = {order: []} as any;
    const res = await channelsAPI.getChannelData(this.curveDataChannelName, parameters, query);
    return res.ok ? res.data.data : null;
  }

  public async loadWellData(state: WState, ids: WellID[], data: ChannelDataDict): Promise<ChannelDataDict[]> {
    const currentFlag = ++this.flag;
    const wellParameterID = state.objects.well.parameterID;
    const globalParameters = state.parameters[state.root.id];

    this.data = data;
    this.mockWellParameter = {...globalParameters.find(p => p.id === wellParameterID)};
    this.wellDataChannels = this.wellDataChannelNames.map(name => state.channels[name]);
    this.wellChannel = state.channels[state.objects.well.channelName];

    this.paramChannelDict = {};
    const clients: FormID[] = [state.root.id, this.parentID, this.formID];

    for (const channel of this.wellDataChannels) {
      const ids = channel.info.parameters.filter(pID => pID !== wellParameterID);
      this.paramChannelDict[channel.name] = fillParamValues(ids, state.parameters, clients);
    }

    const traceCaratData = [];
    for (const wellID of ids) {
      const wellData = await this.getWellData(wellID);
      if (currentFlag !== this.flag) return [];
      traceCaratData.push(wellData);
    }
    return traceCaratData;
  }

  private async getWellData(wellID: WellID): Promise<ChannelDataDict> {
    const idIndex = this.wellChannel.info.lookupColumns.id.index;
    const row = this.wellChannel.data.rows.find(row => row.Cells[idIndex] === wellID);
    if (!row) return null;

    const responses: Promise<Res<any>>[] = [];
    this.mockWellParameter.value = tableRowToString(this.wellChannel, row);

    for (const channel of this.wellDataChannels) {
      const parameters = this.paramChannelDict[channel.name];
      parameters.push(this.mockWellParameter);
      responses.push(channelsAPI.getChannelData(channel.name, parameters, channel.query));
      parameters.pop();
    }

    const dict: ChannelDataDict = {...this.data};
    const data = await Promise.all(responses);

    this.wellDataChannels.forEach((channel, i) => {
      dict[channel.name] = data[i].data?.data ?? null;
    });
    return dict;
  }
}
