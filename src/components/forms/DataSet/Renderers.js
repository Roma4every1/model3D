import { cloneElement } from "react";
import { BaseCell } from "./Cells/BaseCell";


export const CellRender = (props) => {
  const dataItem = props.originalProps.dataItem;
  const cellField = props.originalProps.field;
  const inEditField = dataItem[props.editField || ''];
  const additionalProps = cellField && cellField === inEditField ? {} : {
    onDoubleClick: () => {
      if (props.editable) props.enterEdit(dataItem, cellField);
    },
    onClick: () => {
      props.setActiveCell({row: dataItem, column: cellField});
    }
  };

  const clonedProps = {...props.td.props, ...additionalProps};
  const customProps = {...props.originalProps, ...props.editor, editField: props.editField};
  return cloneElement(props.td, clonedProps, BaseCell(customProps));
};

export const RowRender = (props) => {
  const trProps = {...props.tr.props};
  return cloneElement(props.tr, {...trProps}, props.tr.props.children);
};
