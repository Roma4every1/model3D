import type {
  TableState, TableColumnGroupDict,
  HeaderSetterRule, RecordStyleRule,
} from './types';

import type {
  TableSettingsDTO, TableColumnSettingsDTO, TableColumnGroupSettingsDTO,
  TableViewSettingsDTO, HeaderSetterDTO, RowStyleDTO,
} from './dto.types';

import { toServerColorFormat } from 'shared/lib';
import { TableStateFactory } from './initialization';


/** Функция, возвращающая исходные настройки по состоянию таблицы. */
export function tableStateToSettings (id: FormID, state: TableState): TableSettingsDTO {
  const { data, columns, globalSettings, toolbarSettings } = state;
  const { textWrap, alternate, alternateBackground, tableMode } = globalSettings;

  const columnSettings = columns.list.map((column): TableColumnSettingsDTO => {
    return {
      property: column.id,
      displayName: column.staticDisplayName,
      displayIndex: column.orderIndex,
      width: column.autoWidth ? 1 : column.width,
      foreground: toServerColorFormat(column.cellStyle?.color),
      background: toServerColorFormat(column.cellStyle?.backgroundColor),
      headerForeground: toServerColorFormat(column.headerStyle?.color),
      headerBackground: toServerColorFormat(column.headerStyle?.backgroundColor),
      visible: column.visibilityTemplate?.source ?? String(column.visible),
      readOnly: !column.editable,
      textWrap: column.textWrap === textWrap ? undefined : column.textWrap,
      typeFormat: column.typeFormat,
    };
  });

  const viewSettings: TableViewSettingsDTO = {
    columns: columnSettings,
    columnGroups: serializeGroupSettings(columns.groupSettings),
    rowStyleRules: data.styleRules.map(toRowStyleDTO),
    tableMode: tableMode,
    textWrap: textWrap === TableStateFactory.defaultTextWrap ? undefined : textWrap,
    alternate: alternate,
    alternateBackground: toServerColorFormat(alternateBackground),
    fixedColumnCount: columns.fixedColumnCount,
  };
  return {
    id: id, toolbar: toolbarSettings,
    columnSettings: viewSettings,
    headerSetterRules: columns.headerSetters.map(toHeaderSetterDTO),
    exportToExcel: true, stat: true, columnVisibility: true,
  };
}

function serializeGroupSettings(settings: TableColumnGroupDict): TableColumnGroupSettingsDTO[] {
  const dto: TableColumnGroupSettingsDTO[] = [];
  for (const name in settings) {
    const { displayName, style, borderWidth, borderColor } = settings[name];
    const headerForeground = toServerColorFormat(style.color);
    const headerBackground = toServerColorFormat(style.backgroundColor);
    dto.push({name, displayName, headerForeground, headerBackground, borderWidth, borderColor});
  }
  return dto;
}

function toRowStyleDTO(rule: RecordStyleRule): RowStyleDTO {
  const { property, style, type, sourceCompareValue: parameter } = rule;
  const foreground = toServerColorFormat(style.color);
  const background = toServerColorFormat(style.backgroundColor);
  return {property, type, parameter, foreground, background};
}
function toHeaderSetterDTO(rule: HeaderSetterRule): HeaderSetterDTO {
  return {property: rule.property, parameter: rule.name, column: rule.column};
}
