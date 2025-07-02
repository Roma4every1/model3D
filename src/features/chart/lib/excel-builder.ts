import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import type { ChartProperty, ChartState } from './chart.types';
import { create } from 'xmlbuilder2';
import { serializeParameter, useParameterStore } from 'entities/parameter';
import { serializeColor } from './serialization';


export function buildChartExportXML(state: ChartState, imgPath: string): string {
  const stage = state.stage;
  const builder = new ChartExcelExportBuilder(state);

  builder.addBook('..\\..\\graphTemplate.xls');
  builder.setActiveBook('graphTemplate.xls');
  builder.setActiveSheet('Данные');

  const chartCount = stage.properties.filter(p => !p.empty).length;
  builder.setCellValue(1, 1, 'Графиков');
  builder.setCellValue(1, 2, chartCount);

  const recordCount = stage.getData().records.length;
  builder.setCellValue(2, 1, 'Записей');
  builder.setCellValue(2, 2, recordCount);

  builder.addColumnHeader(state);
  builder.addFillData(state);

  builder.addChartSettingsSheet(state);
  builder.addPicture(imgPath);
  builder.runMacros('Create_Graph');
  builder.returnFile('График.xlsx');

  return builder.build();
}

function calculateStep(minValue: number, maxValue: number): number {
  const diff = Math.abs(maxValue - minValue);
  let x = 1;

  if (diff >= 1) {
    while (diff / x > 1) {
      x *= 10;
    }
    x /= 10;

    const floor = Math.floor(diff / x);
    if (x === 0) return 0.1;
    if (floor <= 3) return x / 8;
    if (floor <= 5) return x / 4;
    return x / 2;
  }

  if (diff <= 1) {
    while (diff / x > 1) {
      x *= 0.1;
    }
    x /= 0.1;

    const floor = Math.floor(diff / x);
    if (x === 0) return 0.1;
    if (floor <= 3) return x / 8;
    if (floor <= 5) return x / 4;
    return x / 2;
  }

  return 0.1;
}

export class ChartExcelExportBuilder {
  private root: XMLBuilder;
  private properties: ChartProperty[];
  private mainChannel: Channel;

  constructor(state: ChartState) {
    this.root = create().ele('ReportString');
    const allChannels = Object.values(state.stage.dataController.getChannelData());
    this.mainChannel = allChannels[0];
    const properties = new Set<ChartProperty>();
    const propertiesNames = new Set<string>();
    const arraysProperties = allChannels.map(ch => ch.config.properties.map(p => p.fromColumn));

    for (const properties of arraysProperties) {
      for (const property of properties) propertiesNames.add(property);
    }
    const seenProperties = [...state.stage.properties.filter((p) => !p.empty)];
    for (const propertyName of propertiesNames){
      const property = seenProperties.find(sp => sp.yProperty.name === propertyName);
      if (property) properties.add(property);
    }
    this.properties = [...properties];
  }

  private mapDisplayTypeToString(type: ChartDisplayType): string {
    switch (type) {
      case 'line': return 'LineSymbols';
      case 'bar': return 'Column';
      case 'area': return 'Area';
      case 'point': return 'XYPlot';
      case 'vertical': return 'Vertical';
    }
  }

  public addBook(path: string): void {
    this.root.ele('addBook').att('name', path);
  }

  public setActiveBook(name: string): void {
    this.root.ele('setActiveBook').att('name', name);
  }

  public setActiveSheet(name: string): void {
    this.root.ele('setActiveSheet').att('name', name);
  }

  public setCellValue(row: number, col: number, value: string | number): void {
    this.root
      .ele('setCellValue')
      .att('row', row.toString())
      .att('col', col.toString())
      .att('value', String(value));
  }

  public addColumnHeader(state: ChartState): void {
    // AxisX-header
    const axisXName = state.stage.properties.find((value: ChartProperty) =>
      value.channel.name === this.mainChannel.name).xProperty.displayName;
    this.setCellValue(3, 1, axisXName);
    // Properties
    this.properties.forEach((prop, index) => {
      const title = prop.displayName;
      this.setCellValue(3, index + 2, title);
    });
  }

  public addFillData(state: ChartState): void {
    const stage = state.stage;
    const dataController = stage.dataController;
    const allChannels = Object.values(dataController.getChannelData());
    const mainChannel = allChannels[0];
    const limit = mainChannel.query?.limit;

    const fillDataAttrs: Record<string, string> = {
      channelName: mainChannel.name,
      startRow: '4',
      patternRow: '5',
      endRow: '6',
      startColumn: '1',
    };

    if (limit === false) {
      fillDataAttrs.readAllRows = 'true';
    } else if (typeof limit === 'number') {
      fillDataAttrs.maxRowCount = limit.toString();
    }
    const fillData = this.root.ele('fillData', fillDataAttrs);

    const parameters = fillData.ele('parameters');
    const seenParams = new Set<string>();

    for (const channel of allChannels) {
      const { parameterNames = [], parameters: paramIds = [] } = channel.config;

      for (let i = 0; i < parameterNames.length; i++) {
        const paramName = parameterNames[i];
        const paramId = paramIds[i];
        const param = useParameterStore.getState().storage.get(paramId);
        const { id, type, value } = serializeParameter(param);

        if (value && id && !seenParams.has(`${paramName}`)) {
          seenParams.add(paramName);
          parameters.ele('parameter', {
            id,
            type,
            value,
          });
        }
      }
      // Filter
      if (channel.query?.filter) {
        const filterXml = this.serializeFilter(channel.query.filter);
        fillData.import(filterXml);
      }
      // Order
      if (channel.query?.order?.length) {
        const sortOrder = fillData.ele('sortOrder');
        for (const sortItem of channel.query.order) {
          const name = sortItem.column;
          const direction = (sortItem.direction || 'ASC').toUpperCase();
          sortOrder.ele('field', { name, direction });
        }
      }
    }
    // Columns
    const columnsOrder = fillData.ele('columnsOrder');
    const firstColumn = [stage.properties.find((value: ChartProperty) => value.channel.name === mainChannel.name).xProperty.fromColumn];
    const usedColumns = firstColumn.concat(
      this.properties.map((p) => p?.yProperty.fromColumn).filter(Boolean) as string[]
    );

    for (const col of usedColumns) {
      columnsOrder.ele('column', { name: col });
    }
  }

  private serializeFilter(filter: FilterNode): any {
    const serializeNode = (node: FilterNode): any => {
      if (node.type === 'and' || node.type === 'or') {
        const elem = create().ele(node.type);
        for (const child of node.value as FilterNode[]) {
          elem.import(serializeNode(child));
        }
        return elem;
      } else {
        const { type, column, value } = node;
        const field = create().ele('and', { fieldName: column || '' });
        const operator = field.ele(this.mapOperatorTag(type));
        this.serializeValue(operator, value);
        return field;
      }
    };
    return create().ele('filter').import(serializeNode(filter)).root();
  }

  private serializeValue(parent: any, value: FilterLeafValue): void {
    if (typeof value === 'number') {
      parent.ele('double', {value});
    } else if (typeof value === 'string') {
      parent.ele('string', {value});
    } else if (typeof value === 'boolean') {
      parent.ele('bool', {value});
    } else if (value instanceof Date) {
      parent.ele('date', {value: value.toISOString().slice(0, 10)});
    } else if (value === null) {
      parent.ele('null');
    }
  }

  private mapOperatorTag(type: FilterLeafType): string {
    switch (type) {
      case 'eq':
        return 'equal';
      case 'neq':
        return 'notEqual';
      case 'gt':
        return 'greater';
      case 'lt':
        return 'less';
      case 'gte':
        return 'greaterAndEqual';
      case 'lte':
        return 'lessAndEqual';
      case 'starts':
        return 'startsWith';
      case 'ends':
        return 'endsWith';
      case 'contains':
        return 'contains';
      default:
        return 'equal';
    }
  }

  public addChartSettingsSheet(state: ChartState): void {
    this.setActiveSheet('Настройки графика');

    const labels = [
      'Line color', // 2
      'Line thickness', // 3
      'Line style (0 -, 1 --, 2 ., 3 -.-, 4 -..-, 5 )', // 4
      'Point visibility', // 5
      'Point color', // 6
      'Point figure (0 - square, 1 - circle)', // 7
      'Point size', // 8
      'Point border color', // 9
      'Point border thickness', // 10
      '',
      '',
      '', // 11-13 (пусто)
      'diagram ID', // 14
      'axis ID', // 15
      'axis color', // 16
      'min', // 17
      'max', // 18
      'axis step', // 19
      'axis area identifier', // 20
      'digits after comma', // 21
      'tooltip', // 22
      'main axis step (1 - hour, 2 - day, 3 - month, 4 - Q, 5 - half of the year, 6 - year)', // 23
      'min date', // 24
      'chart type', // 25
      'axis inverse', // 26
    ];

    // Labels
    labels.forEach((label, idx) => {
      if (label) this.setCellValue(idx + 2, 1, label);
    });

    const axes = new Set<string>();

    // Properties
    this.properties.forEach((prop, index) => {

      const col = index + 2;

      const axis = state.stage.axes.find((ax) => ax.id === prop.yAxisID);
      if (!axes.has(axis.id)) axes.add(axis.id)

      // 2. Line color (в RGB без #)
      const lineColor = colorToInt(serializeColor(prop.color)); //`rgba(${r},${g},${b},${opacity})`

      // 3. Line thickness
      const thickness = prop.sizeMultiplier > 2 ? 2 : prop.sizeMultiplier > 1 ? 1 : 0;

      // 4. Line style: lineStyleIndex
      const lineStyle = prop.lineStyleIndex ?? '0';

      // 5. Point visibility
      const pointVisible = prop.showPoints ? '1' : '0';

      // 6. Point color
      const pointColor = lineColor;

      // 7. Point figure
      const pointShape = 1;

      // 8. Point size
      const pointSize = 2;

      // 9. Point border color
      const borderColor = lineColor;

      // 10. Point border thickness
      const borderThickness = '1';

      const axisCounter = axes.size - 1;

      // 14. diagram ID
      const diagramID = Math.floor(axisCounter / 2);

      // 15. axis ID
      const axisID = Math.floor(axisCounter % 2);

      // 16. axis color
      const axisColor = colorToInt(serializeColor(axis.color));

      // 17. min
      const min = axis?.min?.toString() ?? axis.actualMin;

      // 18. max
      const max = axis?.max?.toString() ?? axis.actualMax;

      // 19. axis step
      const step = axis.tickCount ? (+max - +min)/axis.tickCount : calculateStep(+min, +max);

      // 20.
      const areaID = '0';

      // 21.
      const digits = '4';

      // 22. tooltip — showLabels
      const tooltip = prop.showLabels ? '1' : '0';

      // 23. main axis step
      const mainStep = '3';

      // 24. min date
      // const minDate = '';

      // 25. chart type
      const chartType = this.mapDisplayTypeToString(prop.displayType);

      // 26. axis inverse
      const inverse = axis?.inverse ? '1' : '0';

      this.setCellValue(2, col, lineColor);
      this.setCellValue(3, col, thickness);
      this.setCellValue(4, col, lineStyle);
      this.setCellValue(5, col, pointVisible);
      this.setCellValue(6, col, pointColor);
      this.setCellValue(7, col, pointShape);
      this.setCellValue(8, col, pointSize);
      this.setCellValue(9, col, borderColor);
      this.setCellValue(10, col, borderThickness);

      this.setCellValue(14, col, diagramID);
      this.setCellValue(15, col, axisID);
      this.setCellValue(16, col, axisColor);
      this.setCellValue(17, col, min);
      this.setCellValue(18, col, max);
      this.setCellValue(19, col, step);
      this.setCellValue(20, col, areaID);
      this.setCellValue(21, col, digits);
      this.setCellValue(22, col, tooltip);
      this.setCellValue(23, col, mainStep);
      // this.setCellValue(24, col, minDate);
      this.setCellValue(25, col, chartType);
      this.setCellValue(26, col, inverse);
    });
  }

  public addPicture(path: string): void {
    this.setActiveSheet('Картинка');
    this.root.ele('addPicture', {startRow: '5', startCol: '5', name: path});
  }

  public runMacros(name: string): void {
    this.root.ele('runMacros').att('name', name);
  }

  public returnFile(name: string): void {
    this.root.ele('returnFile').att('name', name);
  }

  public build(): string {
    const xml = this.root.end({prettyPrint: false, headless: true});
    return xml.replace(/'/g, `"`);
  }
}

function parseRgbaString(rgba: string): {r: number; g: number; b: number; a: number} {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
  if (!match) throw new Error(`Invalid rgba string: ${rgba}`);

  const [, r, g, b, a = '1'] = match;
  return {r: parseInt(r), g: parseInt(g), b: parseInt(b), a: parseFloat(a)};
}

function colorToInt(rgba: string): number {
  const { r, g, b } = parseRgbaString(rgba);
  return (b << 16) | (g << 8) | r;
}
