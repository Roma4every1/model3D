import * as React from "react";
import { useSelector } from 'react-redux';
import { mapTree, extendDataItem } from "@progress/kendo-react-common";
import { DropDownTree } from "@progress/kendo-react-dropdowns";
import { filterBy } from "@progress/kendo-react-data-tools";
var utils = require("../../utils");
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

export default function TableCellComboEditor(props) {
    const { id, formId, selectionChanged, externalChannelName } = props;
    const [values, setValues] = React.useState([]);
    const [expanded, setExpanded] = React.useState([]);
    const [valueToShow, setValueToShow] = React.useState(undefined);
    const value = useSelector((state) => state.formParams[formId].find((gp) => gp.id === id).value);
    const sessionManager = useSelector((state) => state.sessionManager);

    const setNewValue = React.useCallback(
        (value, manual) => {
            var newevent = {};
            newevent.target = {};
            newevent.target.name = id;
            newevent.target.manual = manual;
            newevent.target.value = value;
            selectionChanged(newevent);
        },
        [id, selectionChanged],
    );

    const valuesToSelect = useSelector((state) => state.channelsData[externalChannelName]);

    React.useEffect(() => {
        sessionManager.channelsManager.loadAllChannelData(externalChannelName, formId, false);
    }, []);

    const findChildren = React.useCallback((localValues, valuesToSelect) => {
        localValues.forEach(v => {
            v.items = valuesToSelect.filter(row => row.parent === v.id);
            findChildren(v.items, valuesToSelect);
        })
    }, []);

    React.useEffect(() => {
        if (valuesToSelect?.properties) {
            var localValues = [];
            const valuesFromJSON = valuesToSelect?.data?.Rows?.map((row) => utils.tableCellToString(valuesToSelect, row));

            if (valuesFromJSON) {
                if (valuesToSelect.parentIndex >= 0) {
                    localValues = valuesFromJSON.filter(row => row.parent === null);
                    findChildren(localValues, valuesFromJSON);
                }
                else {
                    localValues = valuesFromJSON;
                }
            }
            else {
                localValues = [];
            }

            if (value) {
                let calculatedValueToShow = valuesFromJSON.find(o => String(o.value) === value);
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
        }
    }, [valuesToSelect, findChildren, value]);

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

    return (
        <DropDownTree
            className="parametereditorwithoutwidth"
            popupSettings={{ popupClass: 'dropdownPopup' }}
            name={id}
            data={treeData}
            value={valueToShow}
            dataItemKey={dataItemKey}
            textField="name"
            expandField={expandField}
            onExpandChange={onExpandChange}
            onChange={(event) => {
                setValueToShow(event.value);
                setNewValue(event.value?.value, true);
            }}
        />
    );
}
