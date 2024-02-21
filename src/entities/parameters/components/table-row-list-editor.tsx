import { EditorProps } from './editor-dict';
import { useState, useEffect, useMemo } from 'react';
import { Select } from 'antd';
import { stringToTableCell, tableCellToString, tableRowToString } from '../lib/table-row';


export interface TableRowSelectOption {
  /** Значение селекта, для оптимизации используется индекс в массиве. */
  value: number;
  /** Подпись, которая показывается в выпадающем списке. */
  label: string;
  /** Подпись в нижнем регистре, использующася для поиска. */
  labelLower: string;
  /** Значение из колонки с кодом, приведённое к строке. */
  id: string;
  /** Исходная запись из канала. */
  row: ChannelRow;
}
export type TableRowListEditorProps = EditorProps<ParamTableRow | ParamTableCell | ParamString>;


/** Редактор параметра для типов `tableRow`, `tableCell` и `string` в виде выпадающего списка. */
export const TableRowListEditor = ({parameter, update, channel}: TableRowListEditorProps) => {
  const nullValue = parameter.showNullValue ? -1 : undefined;
  const { type: parameterType, value: parameterValue } = parameter;
  const [value, setValue] = useState(nullValue);

  const rows = channel?.data?.rows;
  const lookupColumns = channel ? channel.info.lookupColumns : null;

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

  const onSelect = (value: number, option: TableRowSelectOption) => {
    setValue(value);
    update(getParameterValue(parameterType, option, channel));
  };
  const onClear = () => {
    setValue(nullValue); update(null);
  };

  return (
    <Select
      options={options} value={value} onSelect={onSelect}
      allowClear={parameter.canBeNull} onClear={onClear}
      showSearch={true} filterOption={filterOption}
      placeholder={parameter.nullDisplayValue}
    />
  );
};

function filterOption(value: string, option: TableRowSelectOption): boolean {
  return option.labelLower.startsWith(value.toLowerCase());
}

function getSelectOptions(parameter: Parameter, rows: ChannelRow[], lookupColumns: LookupColumns): TableRowSelectOption[] {
  const nullOption: TableRowSelectOption = {
    value: -1, label: parameter.nullDisplayValue, labelLower: '',
    id: null, row: null,
  };
  if (!rows || !rows.length || !lookupColumns) {
    return parameter.showNullValue ? [nullOption] : [];
  }

  const idIndex = lookupColumns.id.index;
  let valueIndex = lookupColumns.value.index;
  if (valueIndex === -1) valueIndex = idIndex;

  const options = rows.map((row: ChannelRow, i: number): TableRowSelectOption => {
    const idCell = row.Cells[idIndex];
    const valueCell = row.Cells[valueIndex];
    const id = idCell ? idCell.toString() : '';
    const label = valueCell ? valueCell.toString() : id;
    return {value: i, label, labelLower: label.toLowerCase(), id, row};
  });

  if (parameter.showNullValue) options.push(nullOption);
  return options;
}

function getValueID(type: ParameterType, value: string): string {
  if (type.endsWith('Row')) return stringToTableCell(value, 'LOOKUPCODE');
  if (type.endsWith('Cell')) return value.substring(0, value.indexOf('#'));
  /* type === 'string' */ return value;
}

function getParameterValue(type: ParameterType, option: TableRowSelectOption, channel: Channel): string {
  if (!option.row) return null;
  if (type.endsWith('Row')) return tableRowToString(channel, option.row);
  if (type.endsWith('Cell')) return tableCellToString(channel, option.row);
  /* type === 'string' */ return option.label;
}
