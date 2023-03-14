import { useState, useMemo } from 'react';
import { EditCellProps } from './base-edit-cell';
import { DropDownList, DropDownTree } from '@progress/kendo-react-dropdowns';
import { DropDownListChangeEvent  } from '@progress/kendo-react-dropdowns';
import { DropDownTreeChangeEvent, DropDownTreeExpandEvent } from '@progress/kendo-react-dropdowns';
import { mapTree } from '@progress/kendo-react-common';


/** Редактор ячейки с выборочным значением из списка. */
export const EditCellList = ({value, column, update}: EditCellProps<LookupItemID>) => {
  const dict = column.lookupDict;
  const [innerValue, setInnerValue] = useState({id: value, value: dict[value]});

  const onChange = (e: DropDownListChangeEvent) => {
    const id = e.value.id;
    setInnerValue({id, value: dict[id]}); update(id);
  };

  return (
    <DropDownList
      style={{maxHeight: 24}} rounded={null}
      className={'active-cell-editor'} popupSettings={{popupClass: 'dropdown-popup'}}
      dataItemKey={'id'} textField={'value'} leftRightKeysNavigation={false}
      data={column.lookupData} value={innerValue} onChange={onChange}
    />
  );
};

/** Редактор ячейки с выборочным значением из дерева. */
export const EditCellTree = ({value, column, update}: EditCellProps<LookupItemID>) => {
  const dict = column.lookupDict, data = column.lookupData;
  const [expandList, setExpandList] = useState([]);
  const [innerValue, setInnerValue] = useState({id: value, value: dict[value]});

  const onChange = (e: DropDownTreeChangeEvent) => {
    const id = e.value?.id ?? null;
    if (id === null && !column.allowNull) return;
    setInnerValue(id ? {id, value: dict[id]} : null); update(id);
  };

  const onExpandChange = (event: DropDownTreeExpandEvent) => {
    setExpandList(processExpandList(event.item, expandList))
  };

  const tree = useMemo(() => {
    return processTreeData(data, innerValue, expandList);
  }, [data, innerValue, expandList]);

  return (
    <DropDownTree
      style={{maxHeight: 24}} rounded={null}
      className={'active-cell-editor'} popupSettings={{popupClass: 'dropdown-popup'}}
      dataItemKey={'id'} textField={'value'} subItemsField={'children'} expandField={'expanded'}
      data={tree} value={innerValue} selectField={'selected'}
      onChange={onChange} onExpandChange={onExpandChange}
    />
  );
};

function processTreeData(data, value, expandedList) {
  return mapTree(data, 'children', (item) => {
    const expanded = expandedList.includes(item.id);
    const selected = value && item.id === value.id;
    return {...item, expanded, selected};
  });
}

function processExpandList(item, expandList) {
  const nextExpanded = expandList.slice();
  const index = expandList.indexOf(item.id);
  index === -1 ? nextExpanded.push(item.id) : nextExpanded.splice(index, 1);
  return nextExpanded;
}
