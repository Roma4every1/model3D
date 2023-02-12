import { cloneElement } from 'react';
import { BaseCell } from './cells/base-cell';
// import { GridCellProps } from '@progress/kendo-react-grid';
// import { useTableKeyboardNavigation } from '@progress/kendo-react-data-tools';


export const CellRender = (props) => {
  const dataItem = props.originalProps.dataItem;
  const cellField = props.originalProps.field;
  const inEditField = dataItem[props.editField || ''];

  const additionalProps = cellField && cellField === inEditField ? {} : {
    onDoubleClick: props.editable ? () => {
      props.enterEdit(dataItem, cellField);
    } : undefined,
    onClick: () => {
      props.setActiveCell({row: dataItem, column: cellField});
    }
  };

  const clonedProps = {...props.td.props, ...additionalProps};
  const customProps = {
    dataItem: dataItem,
    format: props.originalProps.format,
    field: cellField,
    editField: props.editField,
    onChange: props.originalProps.onChange,
    editor: props.editor,
  };
  return cloneElement(props.td, clonedProps, BaseCell(customProps));
};

// https://www.telerik.com/kendo-react-ui/components/grid/cells/

// interface CellPropsAdditional {
//   editable: boolean
//   editor: any
//   enterEdit
//   setActiveCell: (data: any) => void,
//   editField: string,
// }

// export const DataSetCell = (props: GridCellProps & CellPropsAdditional) => {
//   const navigationAttributes = useTableKeyboardNavigation(props.id);
//
//   const dataItem = props.dataItem;
//   const cellField = props.field;
//   const inEditField = dataItem[props.editField || ''];
//   const needListeners = cellField && cellField === inEditField;
//
//   const onClick = needListeners ? () => {
//     props.setActiveCell({row: dataItem, column: cellField});
//   } : undefined;
//
//   const onDoubleClick = (props.editable && needListeners) ? () => {
//     props.enterEdit(dataItem, cellField);
//   } : undefined;
//
//   return (
//     <td
//       role={'gridcell'}
//       colSpan={props.colSpan}
//       aria-colindex={props.ariaColumnIndex}
//       aria-selected={props.isSelected}
//       data-grid-col-index={props.columnIndex}
//       {...navigationAttributes}
//       onClick={onClick} onDoubleClick={onDoubleClick}
//     >
//       <BaseCell
//         dataItem={dataItem} format={props.format} field={cellField}
//         editField={props.editField} editor={props.editor} onChange={props.onChange}
//       />
//     </td>
//   );
// };
