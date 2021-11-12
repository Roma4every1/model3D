import * as React from 'react';
import { BaseCell } from "./Cells/BaseCell";

export const CellRender = props => {
    const dataItem = props.originalProps.dataItem;
    const cellField = props.originalProps.field;
    const inEditField = dataItem[props.editField || ''];
    const additionalProps = cellField && cellField === inEditField ? {
    } : {
            onDoubleClick: () => {
                props.enterEdit(dataItem, cellField);
            }
        };
    const clonedProps = {
        ...props.originalProps,
        ...props.editor,
        editField: props.editField,
        ...additionalProps
    };
    return React.createElement(BaseCell, clonedProps, props.td.props.children);
};

export const RowRender = props => {
    const trProps = {
        ...props.tr.props,
        onBlur: () => {
            props.exitEdit();
        }
    };
    return React.cloneElement(props.tr, {
        ...trProps
    }, props.tr.props.children);
};