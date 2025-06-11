import type { EditorProps } from './editor-dict';
import { useState, useEffect, useMemo } from 'react';
import { Select } from 'antd';
import { onSelectKeyDown } from '../lib/utils';
import { rowToParameterValue } from '../impl/table-row';
import { cellToParameterValue } from '../impl/table-cell';


export interface TableRowSelectOption {
  /** Значение селекта, для оптимизации используется индекс в массиве. */
  value: number;
  /** Подпись, которая показывается в выпадающем списке. */
  label: string;
  /** Подпись в нижнем регистре, использующася для поиска. */
  labelLower: string;
  /** Значение из колонки с ID. */
  id: any;
  /** Исходная запись из канала. */
  row: ChannelRow;
}
export type TableRowListEditorProps = EditorProps<'tableRow' | 'tableCell' | 'string'>;


/** Редактор параметра для типов `tableRow`, `tableCell` и `string` в виде выпадающего списка. */
export const TableRowListEditor = ({parameter, update, channel}: TableRowListEditorProps) => {
  const parameterType = parameter.type;
  const parameterValue = parameter.getValue();
  const { showNullValue, nullDisplayValue, disabled, loading } = parameter.editor;

  const nullValue = showNullValue ? -1 : undefined;
  const [value, setValue] = useState(nullValue);

  const rows = channel?.data?.rows;
  const lookupColumns = channel?.config.lookupColumns;

  const options = useMemo(() => {
    return getSelectOptions(parameter, rows, lookupColumns);
  }, [parameter, rows, lookupColumns]);

  useEffect(() => {
    if (parameterValue) {
      const valueID = getValueID(parameterType, parameterValue)
      const valueOption = options.find(option => option.id === valueID);
      setValue(valueOption ? valueOption.value : nullValue);
    } else {
      setValue(nullValue);
    }
  }, [parameterValue, options, nullValue, parameterType]);

  const onSelect = (newValue: number, option: TableRowSelectOption) => {
    if (newValue === value) return;
    setValue(newValue);
    update(getParameterValue(parameterType, option, channel));
  };
  const onClear = () => {
    setValue(nullValue); update(null);
  };

  return (
    <Select
      value={value} options={options} filterOption={filterOption}
      placeholder={nullDisplayValue} allowClear={parameter.nullable} showSearch={true}
      disabled={disabled} loading={loading}
      onSelect={onSelect} onClear={onClear} onKeyDown={onSelectKeyDown}
    />
  );
};

function filterOption(value: string, option: TableRowSelectOption): boolean {
  return option.labelLower.startsWith(value.toLowerCase());
}

function getSelectOptions(parameter: Parameter, rows: ChannelRow[], lookupColumns: LookupColumns): TableRowSelectOption[] {
  const nullOption: TableRowSelectOption = {
    value: -1, label: parameter.editor.nullDisplayValue, labelLower: '',
    id: null, row: null,
  };
  if (!rows || !rows.length || !lookupColumns) {
    return parameter.editor.showNullValue ? [nullOption] : [];
  }

  const idIndex = lookupColumns.id.columnIndex;
  let valueIndex = lookupColumns.value.columnIndex;
  if (valueIndex === -1) valueIndex = idIndex;

  const options = rows.map((row: ChannelRow, i: number): TableRowSelectOption => {
    const idCell = row[idIndex];
    const valueCell = row[valueIndex];
    const label = valueCell !== null ? String(valueCell) : String(idCell);
    return {value: i, label, labelLower: label.toLowerCase(), id: idCell, row};
  });

  if (parameter.editor.showNullValue) options.push(nullOption);
  return options;
}

function getValueID(type: ParameterType, value: any): string {
  if (type === 'tableRow') return value['LOOKUPCODE']?.value;
  if (type === 'tableCell') return value?.value;
  /* type === 'string' */ return value;
}

function getParameterValue(type: ParameterType, option: TableRowSelectOption, channel: Channel): any {
  if (!option.row) return null;
  if (type.endsWith('Row')) return rowToParameterValue(option.row, channel);
  if (type.endsWith('Cell')) return cellToParameterValue(option.row, channel);
  /* type === 'string' */ return option.label;
}
