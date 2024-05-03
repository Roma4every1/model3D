import { EditorProps } from './editor-dict';
import { useState, useEffect, useMemo } from 'react';
import { TreeSelect } from 'antd';


export const IntegerArrayTreeEditor = ({parameter, update, channel}: EditorProps<'integerArray'>) => {
  const valueAll = Number.MIN_SAFE_INTEGER;
  const parameterValue = parameter.getValue();
  const [value, setValue] = useState<number[]>([]);

  const data = useMemo(() => {
    return getDataValues(channel);
  }, [channel]);

  useEffect(() => {
    if (parameterValue && parameterValue.length > 0) {
      setValue(parameterValue.filter(n => data.some(item => item.value === n)));
    } else {
      setValue(null);
    }
  }, [parameterValue, data]);

  const onChange = (newValue: number[]) => {
    if (newValue && newValue.length > 0) {
      if (newValue.includes(valueAll)) newValue = data.map(v => v.value);
    } else {
      newValue = null;
    }
    setValue(newValue); update(newValue);
  };

  const treeData = data.length
    ? [{title: 'Все', value: valueAll, children: [...data]}]
    : undefined;

  return (
    <TreeSelect
      className={'integer-array-tree-editor'} style={{width: '100%'}}
      treeData={treeData} value={value} onChange={onChange}
      placeholder={parameter.editor.nullDisplayValue}
      showSearch={false} showCheckedStrategy={'SHOW_PARENT'}
      treeCheckable={true} treeDefaultExpandAll={true}
    />
  );
};

function getDataValues(channel: Channel) {
  const rows = channel?.data?.rows;
  if (!rows) return [];

  const lookupColumns = channel.config.lookupColumns;
  const idIndex = lookupColumns.id.columnIndex;
  let valueIndex = lookupColumns.value.columnIndex;
  if (valueIndex === -1) valueIndex = idIndex;

  return rows.map((row) => {
    const id = row[idIndex];
    return {value: id, title: row[valueIndex] ?? id};
  });
}
