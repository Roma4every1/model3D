import type { CSSProperties } from 'react';
import type { TableSettingsDTO,  TableColumnSettingsDTO } from './dto.types';
import type { TableState, HeaderSetterRule, RecordStyleRule, TableGlobalSettings, TableColumnGroupDict, TableColumnModel, TableActions, RecordModeState } from './types';
import { InitializationError, fixColorHEX } from 'shared/lib';
import { TableData } from './table-data';
import { TableSelection } from './table-selection';
import { TableColumns } from './table-columns';
import { TableViewportController } from './table-viewport';
import { createColumnFormatter } from './utils';
import { minCellWidth } from './constants';


export function settingsToTableState(payload: FormStatePayload<TableSettingsDTO>): TableState {
  const factory = new TableStateFactory();
  return factory.create(payload);
}

export class TableStateFactory {
  /** Перенос текста по умолчанию. */
  public static defaultTextWrap: boolean = true;
  /** Исходные данные для создания состояния таблицы. */
  private payload: FormStatePayload<TableSettingsDTO>;
  /** DTO настроек. */
  private dto: TableSettingsDTO;
  /** Подключённый канал. */
  private attachedChannel: AttachedChannel;
  /** Модель подключённого канала. */
  private channel: Channel;
  /** Хранилище моделей колонок. */
  private columns: TableColumns;
  /** Глобальные настройки таблицы. */
  private globalSettings: TableGlobalSettings;

  public create(payload: FormStatePayload<TableSettingsDTO>): TableState {
    this.payload = payload;
    this.dto = payload.state.settings;
    this.globalSettings = this.createGlobalSettings();

    this.handleChannel();
    this.handleColumns();

    const styleRules = this.createStyleRules();
    const tableData = new TableData(this.columns, styleRules);
    const tableSelection = new TableSelection();
    const tableViewport = new TableViewportController(tableData, this.columns);

    const emptyFn = () => {};
    const tableActions: TableActions = {
      cellClick: emptyFn, moveCellVertical: emptyFn, moveCellHorizontal: emptyFn,
      moveToFirst: emptyFn, moveToLast: emptyFn,
      addRecord: emptyFn, deleteRecords: emptyFn, endEdit: emptyFn,
    };

    return {
      id: payload.state.id,
      channelID: this.channel.id, lookupChannelIDs: this.getLookupChannelIDs(),
      columns: this.columns, data: tableData, selection: tableSelection,
      viewport: tableViewport, actions: tableActions,
      globalSettings: this.globalSettings,
      toolbarSettings: this.dto.toolbar ?? {},
      activeRecordParameter: this.channel.config.activeRowParameter,
      recordMode: this.createRecordModeState(),
    };
  }

  private handleChannel(): void {
    this.attachedChannel = this.payload.state.channels[0];
    if (!this.attachedChannel) throw new InitializationError('table.no-channel-error');

    this.channel = this.payload.channels[this.attachedChannel.id];
    if (!this.channel) throw new InitializationError('table.no-channel-error');

    const query: ChannelQuerySettings = this.channel.query;
    if (query.limit === undefined) query.limit = 250;
  }

  private getLookupChannelIDs(): ChannelID[] {
    const ids: ChannelID[] = [];
    for (const column of this.columns.list) {
      const id = column.property.lookupChannels[0];
      if (id && !ids.includes(id)) ids.push(id);
    }
    return ids;
  }

  /* --- --- */

  private handleColumns(): void {
    const viewSettings = this.dto.columnSettings;
    const settingsDict: Record<PropertyName, TableColumnSettingsDTO> = {};

    viewSettings?.columns?.forEach((dto) => {
      const propertyName = dto.property;
      if (propertyName) settingsDict[propertyName.toUpperCase()] = dto;
    });
    const columnModels = this.channel.config.properties.map((property: ChannelProperty) => {
      const settings = settingsDict[property.name] ?? {};
      return this.createColumnModel(property, settings);
    });
    this.sortColumns(columnModels);

    const groupSettings = this.createGroupSettings();
    const headerSetterRules = this.createHeaderSetters(columnModels);
    this.columns = new TableColumns(columnModels, groupSettings, headerSetterRules);
    this.columns.createInitLayout(viewSettings?.fixedColumnCount ?? 0);
  }

  private sortColumns(columns: TableColumnModel[]): void {
    let maxOrderIndex = -Infinity;
    columns.forEach((column: TableColumnModel) => {
      const index = column.orderIndex;
      if (index !== null && index > maxOrderIndex) maxOrderIndex = index;
    });
    if (!Number.isFinite(maxOrderIndex)) maxOrderIndex = columns.length;

    columns.forEach((c: TableColumnModel, i: number) => {
      if (c.orderIndex === null) c.orderIndex = maxOrderIndex + i;
    });
    columns.sort((a: TableColumnModel, b: TableColumnModel) => {
      return a.orderIndex - b.orderIndex
    });
    columns.forEach((c: TableColumnModel, i: number) => {
      c.orderIndex = i;
    });
  }

  private createColumnModel(property: ChannelProperty, dto: TableColumnSettingsDTO): TableColumnModel {
    const id = property.name;
    const displayName = dto.displayName || property.displayName || id;
    const visible = dto.visible ?? this.attachedChannel.attachedProperties.includes(property);

    const { foreground: fg, background: bg, headerForeground: hfg, headerBackground: hbg } = dto;
    const cellStyle: CSSProperties = {};
    if (fg && fg !== 'none') cellStyle.color = fixColorHEX(fg);
    if (bg && bg !== 'none') cellStyle.backgroundColor = fixColorHEX(bg);
    const headerStyle: CSSProperties = {};
    if (hfg && hfg !== 'none') headerStyle.color = fixColorHEX(hfg);
    if (hbg && hbg !== 'none') headerStyle.backgroundColor = fixColorHEX(hbg);

    const textWrap = dto.textWrap ?? undefined;
    if (textWrap !== undefined && textWrap !== this.globalSettings.textWrap) {
      cellStyle.textWrap = textWrap ? 'wrap' : 'nowrap';
    }

    let width = dto.width ?? 1;
    const autoWidth = width === 1;
    if (autoWidth) width = undefined;
    else if (width < minCellWidth) width = minCellWidth;

    const format = property.format;
    const formatter = format ? createColumnFormatter(property.format) : undefined;

    let orderIndex = dto.displayIndex;
    if (typeof orderIndex !== 'number') orderIndex = null;

    let fc = property.file?.nameFrom;
    if (fc && this.channel.config.properties.every(p => p.name !== fc)) fc = undefined;

    return {
      id, property, staticDisplayName: displayName,
      headerStyle, cellStyle, typeFormat: dto.typeFormat, formatter, fileColumn: fc,
      displayName: displayName, displayIndex: null, orderIndex,
      width, autoWidth, textWrap,
      fixed: false, visible, nullable: true, editable: dto.readOnly !== true,
      detailChannel: property.detailChannel,
      lookupChannel: property.lookupChannels[0],
    };
  }

  /* --- --- */

  private createGlobalSettings(): TableGlobalSettings {
    const dto = this.dto.columnSettings;
    const tableMode = dto?.tableMode ?? true;
    const alternate = dto?.alternate ?? false;

    const background = dto?.alternateBackground;
    let alternateBackground: ColorString;
    if (background && background !== 'none') alternateBackground = fixColorHEX(background);

    const textWrap = dto?.textWrap ?? TableStateFactory.defaultTextWrap;
    return {tableMode, textWrap, alternate, alternateBackground};
  }

  private createGroupSettings(): TableColumnGroupDict {
    const dto = this.dto.columnSettings?.columnGroups;
    const groupSettings: TableColumnGroupDict = {};
    if (!dto) return groupSettings;

    for (const group of dto) {
      const { headerForeground: fg, headerBackground: bg } = group;
      let style: CSSProperties = {};
      if (fg && fg !== 'none') style.color = fixColorHEX(fg);
      if (bg && bg !== 'none') style.backgroundColor = fixColorHEX(bg);

      const { displayName, borderWidth, borderColor } = group;
      groupSettings[group.name] = {displayName, style, borderWidth, borderColor};
    }
    return groupSettings;
  }

  private createStyleRules(): RecordStyleRule[] {
    const rules = this.dto.columnSettings?.rowStyleRules;
    const result: RecordStyleRule[] = [];
    if (!rules) return result;

    for (let { property, type, parameter, background, foreground } of rules) {
      property = property?.toUpperCase();
      if (!property || this.columns.dict[property] === undefined) continue;

      if (!background && !foreground) continue;
      let style: CSSProperties = {};
      if (foreground) style.color = fixColorHEX(foreground);
      if (background) style.backgroundColor = fixColorHEX(background);

      let compareValue = null;
      if (type === 'equal' && parameter) compareValue = parameter;
      result.push({property, style, type, sourceCompareValue: compareValue, compareValue});
    }
    return result;
  }

  private createHeaderSetters(columns: TableColumnModel[]): HeaderSetterRule[] {
    const rules = this.dto.headerSetterRules;
    const result: HeaderSetterRule[] = [];
    if (!rules) return result;

    const parent: ClientID = this.payload.state.parent;
    const parameters: ParameterDict = this.payload.parameters;

    for (let { property, parameter, column } of rules) {
      property = property?.toUpperCase();
      if (!property || columns.every(c => c.id !== property)) continue;

      const cb = (p: Parameter): boolean => p.name === parameter;
      const p = parameters[parent].find(cb) ?? parameters.root.find(cb);
      if (p && p.type === 'tableRow') result.push({id: p.id, name: parameter, property, column});
    }
    return result;
  }

  private createRecordModeState(): RecordModeState | undefined {
    if (this.globalSettings.tableMode) return undefined;
    let keyColumnWidth = Math.max(...this.columns.leafs.map(c => c.width)) - 18;
    if (!Number.isFinite(keyColumnWidth)) keyColumnWidth = 100;
    return {keyColumnWidth, activeColumn: null};
  }
}
