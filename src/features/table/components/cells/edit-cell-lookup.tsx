import { EditCellProps } from './base-edit-cell';
import { useState } from 'react';
import { DropDownListChangeEvent, DropDownList } from '@progress/kendo-react-dropdowns';
import { DropDownTreeChangeEvent, DropDownTree } from '@progress/kendo-react-dropdowns';


/** Редактор ячейки с выборочным значением из списка. */
export const EditCellList = ({value, column, update}: EditCellProps<LookupItemID>) => {
  const dict = column.lookupDict;
  const [innerValue, setInnerValue] = useState<{value: any}>({value: dict[value]});

  const onChange = (e: DropDownListChangeEvent) => {
    const id = e.value.id;
    setInnerValue({value: dict[id]}); update(id);
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
  const dict = column.lookupDict;
  const [innerValue, setInnerValue] = useState<{value: any}>({value: dict[value]});

  const onChange = (e: DropDownTreeChangeEvent) => {
    const id = e.value.id;
    setInnerValue({value: dict[id]}); update(id);
  };

  return (
    <DropDownTree
      style={{maxHeight: 24}} rounded={null}
      className={'active-cell-editor'} popupSettings={{popupClass: 'dropdown-popup'}}
      dataItemKey={'id'} textField={'value'} subItemsField={'children'}
      data={column.lookupData} value={innerValue} onChange={onChange}
    />
  );
};
