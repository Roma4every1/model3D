import React, { useState, useEffect, useMemo } from 'react';
import { DropDownTree } from '@progress/kendo-react-dropdowns';
import { mapTree } from '@progress/kendo-react-common';


const processTreeData = (data, value, expandedItems) => {
  const callback = (item) => {
    const expanded = expandedItems.includes(item.id);
    const selected = value && item.id === value.id;
    return {...item, expanded, selected};
  };
  return mapTree(data, 'items', callback);
};

const expandedState = (item, expanded) => {
  const nextExpanded = expanded.slice();
  const itemKey = item.id;
  const index = expanded.indexOf(itemKey);
  index === -1 ? nextExpanded.push(itemKey) : nextExpanded.splice(index, 1);
  return nextExpanded;
};

const findChildren = (localValues, valuesToSelect) => {
  for (const value of localValues) {
    value.items = valuesToSelect.filter(row => row.parent === value.id);
    findChildren(value.items, valuesToSelect);
  }
};


export const DropDownCell = ({data: lookupData, dataItem, field, onChange}) => {
  field = field || '';
  const dataValue = dataItem[field] === null ? '' : dataItem[field];

  const [expanded, setExpanded] = useState([]);
  const [values, setValues] = useState([]);
  const [valueToShow, setValueToShow] = useState(undefined);

  const treeData = useMemo(() => {
    return processTreeData(values, valueToShow, expanded);
  }, [expanded, valueToShow, values]);

  useEffect(() => {
    let localValues;

    if (lookupData && lookupData.length) {
      if (lookupData[0].hasOwnProperty('parent')) {
        localValues = lookupData.filter(row => !row.parent);
        findChildren(localValues, lookupData);
      } else {
        localValues = lookupData;
      }
    } else {
      localValues = [];
    }

    if (dataValue) {
      const newValue = lookupData.find((item) => String(item.value) === dataValue);
      setValueToShow(newValue || '');
    } else {
      setValueToShow('');
    }
    setValues(localValues);
  }, [lookupData, dataValue]);

  const handleChange = (e) => {
    const { id, value } = e.value;
    if (!onChange) return;
    dataItem[field + '_jsoriginal'] = id;
    onChange({dataIndex: 0, syntheticEvent: e.syntheticEvent, dataItem, field, value});
  };
  const onExpandChange = (event) => {
    setExpanded(expandedState(event.item, expanded))
  };

  return (
    <DropDownTree
      popupSettings={{popupClass: 'dropdown-popup'}} style={{maxHeight: 20}}
      data={treeData} value={lookupData.find((c) => c.value === dataValue)}
      dataItemKey={'id'} textField={'text'} expandField={'expanded'}
      onExpandChange={onExpandChange} onChange={handleChange}
    />
  );
};
