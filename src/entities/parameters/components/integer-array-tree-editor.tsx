import {getComboBoxItems} from '../lib/utils.ts';
import {EditorProps} from './editor-dict.ts';
import {TreeSelect, TreeSelectProps} from 'antd';
import {useEffect, useMemo, useState} from 'react';

const { SHOW_PARENT } = TreeSelect;

export const IntegerArrayTreeEditor = ({parameter, update, channel}: EditorProps<ParamIntegerArray>) => {
  const nullDisplayValue = parameter.nullDisplayValue ?? 'Нет значения';

  const parameterValue = parameter.value;

  const nullValue = useMemo(() => null, []);
  const [value, setValue] = useState(nullValue);

  const data = getDataValues(channel);

  useEffect(() => {
    if (parameterValue?.length && data) {
      const isDataUpdated = parameterValue.every(pValueItem =>
        data.find(dataItem => dataItem.value === pValueItem)
      );
      setValue(isDataUpdated ? parameterValue : nullValue);
    } else {
      setValue(nullValue);
    }
  }, [parameterValue, data, nullValue]);

  const onChange = (newValue: (number)[]) => {
    if (!data) return;
    if (!newValue) return;
    // получаем все id здесь для 'Все' так как значением TreeSelect не может быть массив
    const allIds = data?.map(v => v.id);

    const newValueFinal = newValue.includes(-1)
      ? allIds
      : newValue.filter(el => el !== null);

    const newValueNullable = newValueFinal?.length ? newValueFinal : nullValue;

    setValue(newValueNullable);
    update(newValueNullable);
  };

  // в значение для опции 'Все' устанавливаем -1, так как TreeSelect не может быть массив
  const treeData = data ? [
    {id: 0, title: 'Все', value: -1, key: -1, children: [ ...data]}
  ] : null;

  const tProps: TreeSelectProps = {
    className: 'integer-array-tree-editor',
    treeData,
    value,
    onChange,
    showSearch: false,
    treeCheckable: true,
    treeDefaultExpandAll: true,
    showCheckedStrategy: SHOW_PARENT,
    placeholder: nullDisplayValue,
    style: {
      width: '100%',
    },
  };

  return <TreeSelect {...tProps} />;
};

function getDataValues(channel: Channel) {
  if (!channel) return null;
  const comboBoxItems = getComboBoxItems(channel);
  return comboBoxItems?.map(row => ({
    id: row.id,
    title: row.name,
    value: row.id,
    key: row.id
  }));
}
