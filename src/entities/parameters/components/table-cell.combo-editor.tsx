import { EditorProps } from './base-editor';
import { useState, useEffect, useMemo } from 'react';
import { mapTree, extendDataItem } from '@progress/kendo-react-common';
import { DropDownTree } from '@progress/kendo-react-dropdowns';
import { filterBy } from '@progress/kendo-react-data-tools';

const subItemsField = 'items';
const fields = {selectField: 'selected', expandField: 'expanded', dataItemKey: 'id', subItemsField};


const tableCellToString = (channel: Channel, row: ChannelRow) => {
  if (!row) return null;

  const addParam = (column, rowValue) => {
    let valueString;
    if (column['NetType'] === "System.DateTime" && rowValue != null) {
      valueString = rowValue + '#' + column['NetType'];
    } else if (rowValue != null) {
      valueString = rowValue + '#' + column['NetType'];
    } else {
      valueString = '#System.DBNull';
    }
    return valueString;
  }

  const editorColumns = channel.info.lookupColumns;
  const idIndex = editorColumns.id.index;
  const parentIndex = editorColumns.parent.index;

  const id = row.Cells[idIndex];
  return {
    id,
    name: row.Cells[editorColumns.value.index],
    value: addParam(channel.data.columns[idIndex], id),
    parent: parentIndex !== -1 ? row.Cells[parentIndex] : undefined,
  };
};

const processTreeData = (data, state, fields) => {
  const { selectField, expandField, dataItemKey, subItemsField } = fields;
  const { expanded, value, filter } = state;
  const filtering = Boolean(filter && filter.value);

  return mapTree(
    filtering ? filterBy(data, [filter], subItemsField) : data,
    subItemsField,
    (item) => {
        const props = {
          [expandField]: expanded.includes(item[dataItemKey]),
          [selectField]: value && item[dataItemKey] === value[dataItemKey],
        };
        return filtering
          ? extendDataItem(item, subItemsField, props)
          : { ...item, ...props };
      }
  );
};

const expandedState = (item, expanded) => {
  const nextExpanded = expanded.slice();
  const itemKey = item.id;
  const index = expanded.indexOf(itemKey);
  index === -1 ? nextExpanded.push(itemKey) : nextExpanded.splice(index, 1);
  return nextExpanded;
};

const findChildren = (localValues, valuesToSelect) => {
  localValues.forEach(value => {
    value.items = valuesToSelect.filter(row => row.parent === value.id);
    findChildren(value.items, valuesToSelect);
  });
};

export const TableCellComboEditor = ({parameter, update, channel}: EditorProps<ParamTableCell>) => {
  const value = parameter.value;
  const [values, setValues] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [valueToShow, setValueToShow] = useState(undefined);

  useEffect(() => {
    if (!channel?.info.properties) return;
    var localValues;
    const valuesFromJSON = channel?.data?.rows?.map((row) => tableCellToString(channel, row));

    if (valuesFromJSON) {
      if (channel.info.lookupColumns.parent.index >= 0) {
        localValues = valuesFromJSON.filter(row => row.parent === null);
        findChildren(localValues, valuesFromJSON);
      } else {
        localValues = valuesFromJSON;
      }
    } else {
      localValues = [];
    }

    if (value) {
      let calculatedValueToShow = valuesFromJSON.find(o => String(o.value) === value);
      if (calculatedValueToShow) {
        setValueToShow(calculatedValueToShow);
      } else {
        setValueToShow('');
      }
    } else {
      setValueToShow('');
    }
    setValues(localValues);
  }, [channel, value]);

  const treeData = useMemo(() => {
    return processTreeData(values, {expanded, valueToShow}, fields);
  }, [expanded, valueToShow, values]);

  const onChange = (event) => {
    setValueToShow(event.value);
    update(event.value?.value);
  };
  const onExpandChange = (event) => {
    setExpanded(expandedState(event.item, expanded))
  };

  return (
    <DropDownTree
      className={'table-cell-combo-editor'}
      popupSettings={{popupClass: 'dropdown-popup'}}
      data={treeData}
      value={valueToShow}
      dataItemKey={'id'}
      textField={'name'}
      expandField={'expanded'}
      onChange={onChange}
      onExpandChange={onExpandChange}
    />
  );
};
