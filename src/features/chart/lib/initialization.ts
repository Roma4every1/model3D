import type { ChartSettingsDTO, ChartAxisDTO, ChartPropertyDTO } from './chart.dto.types';
import type { ChartState, ChartAxis, ChartProperty } from './chart.types';
import { IDGenerator, InitializationError } from 'shared/lib';
import { ChartStage } from './chart-stage';
import { lineDashArrays } from './constants';


interface ChartPropertyInit {
  channel: AttachedChannel;
  xProperty: ChannelProperty;
  yProperty: ChannelProperty;
  settings: ChartPropertyDTO;
}

export function settingsToChartState(payload: FormStatePayload<ChartSettingsDTO>): ChartState {
  const factory = new ChartStateFactory();
  return factory.create(payload);
}

export class ChartStateFactory {
  private idGenerator: IDGenerator;
  private payload: FormStatePayload<ChartSettingsDTO>;
  private dto: ChartSettingsDTO['seriesSettings'];

  private stage: ChartStage;
  private axisDict: Record<ChartAxisID, ChartAxis>;
  private usedChannels: Set<ChannelID>;
  private usedLookups: Set<ChannelID>;

  public create(payload: FormStatePayload<ChartSettingsDTO>): ChartState {
    this.idGenerator = new IDGenerator(1);
    this.payload = payload;
    this.dto = payload.state.settings.seriesSettings;

    this.createStage();
    this.stage.axes = this.createAxes();
    this.stage.properties = this.createProperties(this.handleChannels());

    return {
      id: payload.state.id,
      usedChannels: [...this.usedChannels], usedLookups: [...this.usedLookups],
      global: {showTooltip: false}, stage: this.stage,
    };
  }

  private createStage(): void {
    const [firstChannel] = Object.keys(this.dto ?? {});
    if (firstChannel === undefined) throw new InitializationError('chart.empty');

    const settings = this.dto[firstChannel];
    const xAxisType = this.resolveXAxisType(settings.xAxisType);
    this.stage = new ChartStage(xAxisType);

    if (xAxisType === 'date') {
      const dateStep = settings.dateStep?.toLowerCase();
      this.stage.dateStep = dateStep === 'year' ? 'year' : 'month';
    }
  }

  private handleChannels(): ChartPropertyInit[] {
    const inits: ChartPropertyInit[] = [];
    for (const attachedChannel of this.payload.state.channels) {
      const channel = this.payload.channels[attachedChannel.id];
      if (!channel) continue;

      const dto = this.dto[channel.name];
      if (!dto || !dto.xAxisFieldName || !dto.seriesSettings) continue;
      if (this.resolveXAxisType(dto.xAxisType) !== this.stage.xAxisType) continue;

      const xProperty = channel.config.properties.find(p => p.name === dto.xAxisFieldName);
      if (!xProperty) continue;

      for (const yProperty of attachedChannel.attachedProperties) {
        if (yProperty === xProperty) continue;
        const settings = dto.seriesSettings[yProperty.name];
        if (settings) inits.push({channel: attachedChannel, xProperty, yProperty, settings});
      }
    }
    return inits;
  }

  /* --- Chart Axes --- */

  private createAxes(): ChartAxis[] {
    this.axisDict = {};
    for (const { axesSettings } of Object.values(this.dto)) {
      if (!axesSettings) continue;
      for (const axisID in axesSettings) {
        const axis = this.createAxis(axisID, axesSettings[axisID]);
        if (axis) this.axisDict[axisID] = axis;
      }
    }
    return Object.values(this.axisDict);
  }

  private createAxis(id: ChartAxisID, dto: ChartAxisDTO): ChartAxis {
    const scale = this.resolveAxisScale(dto.scale);
    const location = this.resolveYAxisLocation(dto.location);

    return {
      id, min: dto.min ?? null, max: dto.max ?? null, tickCount: dto.tickCount ?? null,
      scale, location, color: dto.color, displayName: dto.displayName,
      inverse: dto.inverse ?? false,
    };
  }

  /* --- Chart Properties --- */

  private createProperties(inits: ChartPropertyInit[]): ChartProperty[] {
    this.usedChannels = new Set();
    this.usedLookups = new Set();
    return inits.map(init => this.createProperty(init)).filter(Boolean);
  }

  private createProperty(init: ChartPropertyInit): ChartProperty | null {
    const { channel, xProperty, yProperty, settings } = init;
    const yAxisID = settings.yAxisId;
    if (!yAxisID || this.axisDict[yAxisID] === undefined) return null;

    const [displayType, curveType] = this.resolveTypeCode(settings.typeCode);
    const displayName = yProperty.displayName ?? yProperty.name;
    const color = settings.color ?? '#000';

    const lineDash = lineDashArrays[settings.lineStyleIndex];
    const showLine = settings.showLine ?? true;
    const showPoint = settings.showPoint ?? true;
    const showLabels = settings.showLabels ?? false;
    // FIXME: zIndex

    if (displayType === 'vertical') {
      const lookup = yProperty.lookupChannels[0];
      if (lookup) this.usedLookups.add(lookup);
    }
    this.usedChannels.add(channel.id);

    return {
      id: this.idGenerator.get().toString(),
      channel, xProperty, yProperty, yAxisID,
      displayName, displayType, curveType, color,
      lineDash, showLine, showPoint, showLabels,
      visible: true, empty: true,
    };
  }

  /* --- Utils --- */

  private resolveXAxisType(input: string | null | undefined): ChartXAxisType {
    if (input) {
      input = input.toLowerCase();
      if (input === 'dates') return 'date';
      // if (input === 'categories') return 'category';
    }
    return 'number';
  }

  private resolveYAxisLocation(input: string | null | undefined): ChartYAxisLocation {
    return input?.toLowerCase() === 'right' ? 'right' : 'left';
  }

  private resolveAxisScale(input: string | null | undefined): ChartAxisScale {
    return input?.toLowerCase() === 'log' ? 'log' : 'linear';
  }

  private resolveTypeCode(input: string | null | undefined): [ChartDisplayType, ChartCurveType] {
    let displayType: ChartDisplayType = 'line';
    let curveType: ChartCurveType = 'linear';

    switch (input) {
      case 'graphSpline': { curveType = 'monotone'; break; }
      case 'graphDiscr': { curveType = 'stepAfter'; break; }
      case 'area': { displayType = 'area'; break; }
      case 'areaSpline': { displayType = 'area'; curveType = 'monotone'; break; }
      case 'areaDiscr': { displayType = 'area'; curveType = 'stepAfter'; break; }
      case 'gist': { displayType = 'bar'; break; }
      case 'gistStack': { displayType = 'bar'; break; }
      case 'point': { displayType = 'point'; break; }
      case 'vertical': { displayType = 'vertical'; break; }
    }
    return [displayType, curveType];
  }
}
