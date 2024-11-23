import type { ChartSettingsDTO, ChartAxisDTO, ChartPropertyDTO } from './chart.dto.types';
import type { ChartState, ChartAxis, ChartProperty, ChartDotOptions } from './chart.types';
import { rgb } from 'd3-color';
import { IDGenerator, InitializationError } from 'shared/lib';
import { ChartStage } from './chart-stage';
import { lineDashArrays } from './constants';
import { createDotRenderer } from '../components/elements/dots';


interface ChartPropertyInit {
  channel: AttachedChannel;
  xProperty: ChannelProperty;
  yProperty: ChannelProperty;
  settings: ChartPropertyDTO;
  z: number | null;
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
      const dateStep = this.resolveDateStep(settings.dateStep);
      this.stage.dataController.setDateStep(dateStep);
    }
  }

  private handleChannels(): ChartPropertyInit[] {
    const inits: ChartPropertyInit[] = [];
    const xAxisType = this.stage.dataController.xType;

    for (const attachedChannel of this.payload.state.channels) {
      const channel = this.payload.channels[attachedChannel.id];
      if (!channel) continue;

      const dto = this.dto[channel.name];
      if (!dto || !dto.xAxisFieldName || !dto.seriesSettings) continue;
      if (this.resolveXAxisType(dto.xAxisType) !== xAxisType) continue;

      const xName = dto.xAxisFieldName.toUpperCase();
      const xProperty = channel.config.properties.find(p => p.name === xName);
      if (!xProperty) continue;

      for (const yProperty of attachedChannel.attachedProperties) {
        if (yProperty === xProperty) continue;
        const settings = dto.seriesSettings[yProperty.name];
        if (!settings) continue;
        const z = settings.zIndex ?? null;
        inits.push({channel: attachedChannel, xProperty, yProperty, settings, z});
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
    const color = rgb(dto.color).formatHex();

    let min = dto.min ?? null;
    let max = dto.max ?? null;
    let tickCount = dto.tickCount ?? null;

    if (min !== null && max !== null && min > max) {
      let temp = min;
      min = max;
      max = temp;
    }
    if (tickCount !== null && tickCount < 1) {
      tickCount = null;
    }
    return {
      id, min, max, tickCount, scale, location, color,
      displayName: dto.displayName ?? '', inverse: dto.inverse ?? false,
    };
  }

  /* --- Chart Properties --- */

  private createProperties(inits: ChartPropertyInit[]): ChartProperty[] {
    let minZ = Infinity;
    inits.forEach((init: ChartPropertyInit) => {
      const z = init.z;
      if (z !== null && z < minZ) minZ = z;
    });
    if (!Number.isFinite(minZ)) minZ = inits.length;

    inits.forEach((init: ChartPropertyInit, i: number) => {
      if (init.z === null) init.z = minZ - (i + 1);
    });
    inits.sort((a: ChartPropertyInit, b: ChartPropertyInit) => {
      return b.z - a.z;
    });

    this.usedChannels = new Set();
    this.usedLookups = new Set();
    return inits.map(init => this.createProperty(init)).filter(Boolean);
  }

  private createProperty(init: ChartPropertyInit): ChartProperty | null {
    const { channel, xProperty, yProperty, settings } = init;
    const yAxisID = settings.yAxisId;
    if (!yAxisID || this.axisDict[yAxisID] === undefined) return null;

    const [displayType, curveType] = this.resolveTypeCode(settings.typeCode);
    const displayName = settings.displayName || yProperty.displayName || yProperty.name;
    const color = rgb(settings.color).formatHex();
    const lineDash = this.calcDashArray(settings);

    const dotOptions = this.calcDotOptions(settings);
    const dotRenderer = createDotRenderer(dotOptions);

    const showLine = settings.showLine ?? true;
    const showPoints = settings.showPoint ?? true;
    const showLabels = settings.showLabels ?? displayType === 'vertical';

    this.usedChannels.add(channel.id);
    const lookup = yProperty.lookupChannels[0];
    if (lookup) this.usedLookups.add(lookup);

    return {
      id: this.idGenerator.get().toString(),
      channel, xProperty, yProperty, yAxisID,
      displayName, displayType, curveType, color, lineDash,
      dotOptions, dotRenderer, showLine, showPoints, showLabels,
      visible: true, empty: true,
    };
  }

  private calcDashArray(settings: ChartPropertyDTO): string | undefined {
    let pattern = lineDashArrays[Number(settings.lineStyleIndex)];
    if (!pattern) return undefined;

    const sizeMultiplier = settings.sizeMultiplier || 2;
    if (sizeMultiplier !== 1) {
      pattern = pattern.map(size => size * sizeMultiplier);
    }
    return pattern.join(' ');
  }

  private calcDotOptions(settings: ChartPropertyDTO): ChartDotOptions {
    const shapeIndex = settings.pointFigureIndex;
    const size = 4 * (settings.sizeMultiplier || 2);

    switch (shapeIndex) {
      case '1': return {shape: 1, size};
      case '2': return {shape: 2, size};
      case '3': return {shape: 3, size};
      case '4': return {shape: 4, size};
    }
    return {shape: 0, size};
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

  private resolveDateStep(input: string | null | undefined): ChartDateStep {
    if (input) {
      input = input.toLowerCase();
      if (input === 'year' || input === 'day') return input;
    }
    return 'month';
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
      case 'graphSpline': { curveType = 'natural'; break; }
      case 'graphDiscr': { curveType = 'stepAfter'; break; }
      case 'area': { displayType = 'area'; break; }
      case 'areaSpline': { displayType = 'area'; curveType = 'natural'; break; }
      case 'areaDiscr': { displayType = 'area'; curveType = 'stepAfter'; break; }
      case 'gist': { displayType = 'bar'; break; }
      case 'gistStack': { displayType = 'bar'; break; }
      case 'point': { displayType = 'point'; break; }
      case 'vertical': { displayType = 'vertical'; break; }
    }
    return [displayType, curveType];
  }
}
