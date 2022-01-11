import * as React from "react";
import { mapTree, extendDataItem } from "@progress/kendo-react-common";
import { DropDownTree } from "@progress/kendo-react-dropdowns";
import { filterBy } from "@progress/kendo-react-data-tools";
const selectField = "selected";
const expandField = "expanded";
const dataItemKey = "id";
const subItemsField = "items";
const fields = {
    selectField,
    expandField,
    dataItemKey,
    subItemsField,
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

const expandedState = (item, dataItemKey, expanded) => {
    const nextExpanded = expanded.slice();
    const itemKey = item[dataItemKey];
    const index = expanded.indexOf(itemKey);
    index === -1 ? nextExpanded.push(itemKey) : nextExpanded.splice(index, 1);
    return nextExpanded;
};

export const DropDownCell = (props) => {
    const [expanded, setExpanded] = React.useState([]);
    const [values, setValues] = React.useState([]);
    const [valueToShow, setValueToShow] = React.useState(undefined);
    const { dataItem, lookupData } = props;
    const field = props.field || "";
    const dataValue = dataItem[field] === null ? "" : dataItem[field];

    const handleChange = (e) => {
        if (props.onChange) {
            dataItem[props.field + '_jsoriginal'] = e.value.id;
            props.onChange({
                dataIndex: 0,
                dataItem: props.dataItem,
                field: props.field,
                syntheticEvent: e.syntheticEvent,
                value: e.value.value
            });
        }
    };

    const onExpandChange = React.useCallback(
        (event) => setExpanded(expandedState(event.item, dataItemKey, expanded)),
        [expanded]
    );
    const treeData = React.useMemo(
        () =>
            processTreeData(
                values,
                {
                    expanded,
                    valueToShow,
                },
                fields
            ),
        [expanded, valueToShow, values]
    );

    const findChildren = React.useCallback((localValues, valuesToSelect) => {
        localValues.forEach(v => {
            v.items = valuesToSelect.filter(row => row.parent === v.id);
            findChildren(v.items, valuesToSelect);
        })
    }, []);

    React.useEffect(() => {
        var localValues = [];
        const valuesFromJSON = lookupData;

        if (valuesFromJSON && valuesFromJSON.length > 0) {
            if (valuesFromJSON[0].hasOwnProperty('parent')) {
                localValues = valuesFromJSON.filter(row => !row.parent);
                findChildren(localValues, valuesFromJSON);
            }
            else {
                localValues = valuesFromJSON;
            }
        }
        else {
            localValues = [];
        }

        if (dataValue) {
            let calculatedValueToShow = valuesFromJSON.find(o => String(o.value) === dataValue);
            if (calculatedValueToShow) {
                setValueToShow(calculatedValueToShow);
            }
            else {
                setValueToShow('');
            }
        }
        else {
            setValueToShow('');
        }
        setValues(localValues);
    }, [lookupData, findChildren, dataValue]);

    return (
        <DropDownTree
            popupSettings={{ popupClass: 'dropdownPopup' }}
            data={treeData}
            value={lookupData.find((c) => c.value === dataValue)}
            dataItemKey={dataItemKey}
            textField="text"
            expandField={expandField}
            onExpandChange={onExpandChange}
            onChange={handleChange}
        />
    );
};