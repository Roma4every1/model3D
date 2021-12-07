import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Grid,
    GridColumn as Column,
    getSelectedState,
    getSelectedStateFromKeyDown
} from "@progress/kendo-react-grid";
import { ColumnMenu, ColumnMenuCheckboxFilter } from "./ColumnMenu";
import { SecondLevelTable } from "./SecondLevelTable";
import {
    Button
} from "@progress/kendo-react-buttons";
import {
    IntlProvider,
    load,
    LocalizationProvider,
    loadMessages,
} from "@progress/kendo-react-intl";
import calculateSize from "calculate-size";
import likelySubtags from "cldr-core/supplemental/likelySubtags.json";
import currencyData from "cldr-core/supplemental/currencyData.json";
import weekData from "cldr-core/supplemental/weekData.json";
import numbers from "cldr-numbers-full/main/ru/numbers.json";
import currencies from "cldr-numbers-full/main/ru/currencies.json";
import caGregorian from "cldr-dates-full/main/ru/ca-gregorian.json";
import dateFields from "cldr-dates-full/main/ru/dateFields.json";
import timeZoneNames from "cldr-dates-full/main/ru/timeZoneNames.json";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { getter } from "@progress/kendo-react-common";
import { useTranslation } from 'react-i18next';
import { CellRender, RowRender } from "./Renderers";
import addParam from "../../../store/actionCreators/addParam";
import addParamSet from "../../../store/actionCreators/addParamSet";
import updateParamSet from "../../../store/actionCreators/updateParamSet";
import FormHeader from '../Form/FormHeader';
import ruMessages from "../../locales/kendoUI/ru.json";
import setFormSettings from "../../../store/actionCreators/setFormSettings";
load(
    likelySubtags,
    currencyData,
    weekData,
    numbers,
    currencies,
    caGregorian,
    dateFields,
    timeZoneNames
);
loadMessages(ruMessages, "ru-RU");
var utils = require("../../../utils");
var _ = require("lodash");
const DATA_ITEM_KEY = "js_id";
const SELECTED_FIELD = "js_selected";
const EDIT_FIELD = "js_inEdit";
const idGetter = getter(DATA_ITEM_KEY);

function DataSetView(props, ref) {
    const addRowCount = 500;
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const sessionManager = useSelector((state) => state.sessionManager);
    const sessionId = useSelector((state) => state.sessionId);
    const { inputTableData, formData, apply, deleteRows, getRow, reload, editable, dataPart, activeChannelName } = props;
    const [rowAdding, setRowAdding] = React.useState(false);
    const [edited, setEdited] = React.useState(false);
    const [activeCell, setActiveCell] = React.useState(null);
    const [tableData, setTableData] = React.useState({
        rowsJSON: [],
        columnsJSON: []
    });
    const [dataState, setDataState] = React.useState();
    const [editField, setEditField] = React.useState(undefined);
    const [editID, setEditID] = React.useState(null);
    const [selectedState, setSelectedState] = React.useState({});
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [skip, setSkip] = React.useState(0);

    const tableSettings = useSelector((state) => state.formSettings[formData.id]);
    const [opened, setOpened] = React.useState({});

    React.useEffect(() => {
        if (inputTableData.properties) {
            let neededParamArray = { channelName: activeChannelName, params: [] };
            inputTableData.properties.forEach(prop => {
                const conditionElement = {
                    id: prop.name + "ConditionFilterObject",
                    type: "condition"
                };
                neededParamArray.params.push(conditionElement);
            });
            dispatch(addParamSet(neededParamArray));
        }
    }, [activeChannelName, inputTableData.properties, dispatch]);

    React.useEffect(() => {
        const maxRowCountElement = {
            id: "maxRowCount",
            type: "integer"
        };
        const sortOrder = {
            id: "sortOrder",
            type: "sortOrder"
        }
        dispatch(addParam(activeChannelName, maxRowCountElement));
        dispatch(addParam(activeChannelName, sortOrder));
    }, [activeChannelName, dispatch]);

    React.useEffect(() => {
        if (dataState) {
            let neededParamArray = [];
            if (!dataState.sort) {
                neededParamArray.push({ name: "sortOrder", value: null });
            }
            else {
                var newValue = dataState.sort.map(el => {
                    let field = el.field;
                    if (inputTableData.properties) {
                        const property = _.find(inputTableData.properties, function (o) { return o.name === el.field; });
                        field = property.fromColumn ?? property.name;
                    }
                    return `${field} ${el.dir}`;
                }).join(',');
                neededParamArray.push({ name: "sortOrder", value: newValue });
            }
            if (dataState.filter) {
                dataState.filter.filters.forEach(flt => {
                    let filterValue = `<${flt.logic}>`;
                    let fieldName = flt.filters[0].field;
                    let col = inputTableData.columnsJSON.find(c => c.field === fieldName);
                    flt.filters.forEach(filter => {
                        let operation = "equal"
                        switch (filter.operator) {
                            case "eq":
                                operation = "equal";
                                break;
                            case "gt":
                                operation = "greater";
                                break;
                            case "lt":
                                operation = "less";
                                break;
                            case "gte":
                                operation = "greaterAndEqual";
                                break;
                            case "lte":
                                operation = "lessAndEqual";
                                break;
                            case "neq":
                                operation = "notEqual";
                                break;
                            case "isnull":
                            case "isnullempty":
                                operation = "isNull";
                                break;
                            case "isnotnull":
                            case "isnotempty":
                                operation = "isNotNull";
                                break;
                            case "contains":
                                operation = "contains";
                                break;
                            case "doesnotcontains":
                                operation = "notContains";
                                break;
                            case "startswith":
                                operation = "startsWith";
                                break;
                            case "endswith":
                                operation = "endsWith";
                                break;
                            default:
                                operation = "equal";
                        }
                        let center = "";
                        let fieldFilter = filter.value;
                        if (col.lookupData) {
                            fieldFilter = col.lookupData.find(ld => ld.value === fieldFilter).id;
                        }
                        if (!operation.includes("Null")) {
                            center = `<netType typeName="${col.netType}" value="${utils.dateToString(fieldFilter)}"/>`
                        }
                        filterValue += `<${operation}>${center}</${operation}>`;
                    });
                    filterValue += `</${flt.logic}>`;
                    neededParamArray.push({ name: fieldName + "ConditionFilterObject", value: filterValue });
                });
            }
            inputTableData.columnsJSON.forEach(c => {
                let needClear = (!dataState.filter) || !dataState.filter.filters.some(flt => flt.filters[0].field === c.field);
                if (needClear) {
                    neededParamArray.push({ name: c.field + "ConditionFilterObject", value: null });
                }
            });
            dispatch(updateParamSet(activeChannelName, neededParamArray));
        }
    }, [dataState, activeChannelName, sessionManager, inputTableData, dispatch]);

    const pageChange = (event) => {
        setSkip(event.page.skip);
        if (dataPart && (dataToShow.length < event.page.skip + 50)) {
            sessionManager.paramsManager.updateParamValue(activeChannelName, "maxRowCount", dataToShow.length + addRowCount, true);
        }
    };

    const handleDeleteDialogOpen = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
    };

    const addRecord = async (existingRecord, addToEnd) => {
        var copy = true;
        var toEnd = false;
        var index = Math.min(Object.entries(selectedState).filter(e => e[1] === true).map(e => e[0]));
        if (index === tableData.rowsJSON.length - 1) {
            toEnd = true;
        }
        if (index === Infinity) {
            copy = false;
            index = 1;
        }

        var newRecord;
        if (existingRecord && copy) {
            newRecord = {
                ...tableData.rowsJSON[index],
                [DATA_ITEM_KEY]: tableData.rowsJSON.length + 1,
            };
        }
        else {
            newRecord = await getRow();
        }
        if (toEnd && addToEnd) {
            setTableData({ rowsJSON: [...tableData.rowsJSON, newRecord], columnsJSON: tableData.columnsJSON });
        }
        else if (!toEnd) {
            var startPart = tableData.rowsJSON.slice(0, index);
            var finishPart = tableData.rowsJSON.slice(index);
            setTableData({ rowsJSON: [...startPart, newRecord, ...finishPart], columnsJSON: tableData.columnsJSON });
        }
        if (!toEnd || addToEnd) {
            setEditID(idGetter(newRecord));
            setRowAdding(true);
        }
    };

    const excelExport = async () => {
        const dataD = sessionManager.channelsManager.getAllChannelParams(activeChannelName);
        var neededParamValues = sessionManager.paramsManager.getParameterValues(dataD, formData.id, false, activeChannelName);
        var jsonToSend = {
            sessionId: sessionId,
            channelName: activeChannelName,
            paramName: formData.displayName,
            presentationId: utils.getParentFormId(formData.id),
            paramValues: neededParamValues,
            settings: tableSettings?.columns
        };
        const jsonToSendString = JSON.stringify(jsonToSend);
        var data = await sessionManager.fetchData(`exportToExcel`,
            {
                method: 'POST',
                body: jsonToSendString
            });
        sessionManager.watchReport(data.OperationId, data);
    };

    const onItemChange = (event) => {
        setEdited(true);
        const editedItemID = idGetter(event.dataItem);
        const data = tableData.rowsJSON.map(item =>
            idGetter(item) === editedItemID ? (event.dataItem[event.field + '_jsoriginal'] ? { ...item, [event.field]: event.value, [event.field + '_jsoriginal']: event.dataItem[event.field + '_jsoriginal'] } : { ...item, [event.field]: event.value }) : item
        );
        setTableData({ rowsJSON: data, columnsJSON: tableData.columnsJSON });
    };

    const onSelectionChange = (event) => {
        const newSelectedState = getSelectedState({
            event,
            selectedState: selectedState,
            dataItemKey: DATA_ITEM_KEY,
        });
        if (!_.isEqual(newSelectedState, selectedState)) {
            setSelectedState(newSelectedState);
            if (edited) {
                applyEdit();
            }
            setEditID(null);
        }
    };

    const onKeyDown = (event) => {
        const newSelectedState = getSelectedStateFromKeyDown({
            event,
            selectedState: selectedState,
            dataItemKey: DATA_ITEM_KEY,
        });
        if (!_.isEqual(newSelectedState, selectedState)) {
            setSelectedState(newSelectedState);
            if (edited) {
                applyEdit();
            }
            setEditID(null);
        }

        switch (event.nativeEvent.key) {
            case 'Insert': {
                if (editable) {
                    if (event.nativeEvent.ctrlKey) {
                        addRecord(true);
                    }
                    else {
                        addRecord();
                    }
                }
                break;
            }
            case 'Escape': {
                exitEdit();
                break;
            }
            case 'Delete': {
                if (editable && !(editID && editField)) {
                    handleDeleteDialogOpen();
                }
                break;
            }
            case 'Enter': {
                if (edited) {
                    applyEdit();
                }
                break;
            }
            case 'Home': {
                if (event.nativeEvent.ctrlKey) {
                    if (tableData.rowsJSON.length > 0) {
                        setSelectedState({ 0: true });
                        applyEdit();
                        setEditID(null);
                    }
                }
                break;
            }
            case 'End': {
                if (event.nativeEvent.ctrlKey) {
                    if (tableData.rowsJSON.length > 0) {
                        let rowIndex = tableData.rowsJSON.length - 1;
                        let newState = {};
                        newState[rowIndex] = true;
                        setSelectedState(newState);
                        applyEdit();
                        setEditID(null);
                    }
                }
                break;
            }
            case 'PageUp': {
                if (tableData.rowsJSON.length > 0) {
                    setSelectedState({ 0: true });
                    applyEdit();
                    setEditID(null);
                }
                break;
            }
            case 'PageDown': {
                if (tableData.rowsJSON.length > 0) {
                    let rowIndex = tableData.rowsJSON.length - 1;
                    let newState = {};
                    newState[rowIndex] = true;
                    setSelectedState(newState);
                    applyEdit();
                    setEditID(null);
                }
                break;
            }
            case 'Ф':
            case 'ф':
            case 'A':
            case 'a': {
                if (event.nativeEvent.ctrlKey) {
                    selectAll();
                    event.nativeEvent.preventDefault();
                }
                break;
            }
            case 'ArrowUp': {
                break;
            }
            case 'ArrowDown': {
                if (editable && (!rowAdding) && !(editID && editField)) {
                    var index = Math.min(Object.entries(selectedState).filter(e => e[1] === true).map(e => e[0]));
                    if (index === tableData.rowsJSON.length - 1) {
                        if (event.nativeEvent.ctrlKey) {
                            addRecord(true, true);
                        }
                        else {
                            addRecord(false, true);
                        }
                    }
                }
                break;
            }
            default: {
                break;
            }
        }
    };

    React.useEffect(() => {
        if (inputTableData.currentRowObjectName) {
            if (Object.entries(selectedState).filter(e => e[1] === true).length === 1) {
                let row = Object.entries(selectedState).find(e => e[1] === true);
                sessionManager.paramsManager.updateParamValue(utils.getParentFormId(formData.id), inputTableData.currentRowObjectName, utils.tableRowToString(inputTableData.databaseData, inputTableData.databaseData.data.Rows[row[0]]).value, true);
            }
        }
    }, [selectedState, inputTableData, sessionManager, formData]);

    React.useEffect(() => {
        var columnNames = [];
        if (!tableSettings || !tableSettings.attachedProperties) {
            setTableData(inputTableData);
        }
        else {
            if (tableSettings?.attachedProperties?.attachOption !== "AttachNothing") {
                columnNames = inputTableData.columnsJSON.map(c => c.field).filter(f => !tableSettings?.attachedProperties?.exclude.includes(f));
            }
            else {
                if (tableSettings?.attachedProperties?.exclude) {
                    columnNames = tableSettings?.attachedProperties?.exclude
                }
            }
            if (tableSettings.columns.columnsSettings) {
                tableSettings.columns.columnsSettings.sort((a, b) => a.displayIndex - b.displayIndex);
                columnNames = tableSettings.columns.columnsSettings.map(s => s.channelPropertyName).filter(n => columnNames.includes(n));
            }
            var columns = columnNames.map(c => inputTableData.columnsJSON.find(jsc => jsc.field === c));
            var count = tableSettings.columns.frozenColumnCount ?? 0;
            for (let i = 0; i < columns.length; i++) {
                columns[i].locked = i < count;
            }
            setTableData({ rowsJSON: inputTableData.rowsJSON, columnsJSON: columns });
        }
    }, [inputTableData, tableSettings]);

    async function deleteSelectedRows() {
        var elementsToRemove = ',';
        var tableDataCopy = tableData;
        Object.keys(selectedState).forEach(element => {
            if (selectedState[element]) {
                elementsToRemove = elementsToRemove + element + ',';
                const itemToDeleteIndex = tableDataCopy.rowsJSON.findIndex(item =>
                    String(idGetter(item)) === String(element)
                );
                if (itemToDeleteIndex !== -1) {
                    tableDataCopy.rowsJSON.splice(itemToDeleteIndex, 1);
                }
            }
        });
        if (elementsToRemove.length > 1) {
            setTableData({
                rowsJSON: tableDataCopy.rowsJSON,
                columnsJSON: tableDataCopy.columnsJSON
            });
            elementsToRemove = elementsToRemove.slice(1, -1);
            deleteRows(elementsToRemove);
        }
    };

    var dataToShow = tableData.rowsJSON;
    dataToShow = dataToShow.map((item) => ({
        ...item,
        [SELECTED_FIELD]: selectedState[idGetter(item)],
        [EDIT_FIELD]: idGetter(item) === editID
    }));

    const calculateWidth = (headerName, field) => {
        if (tableSettings && tableSettings.columns) {
            var columnSetting = tableSettings.columns.columnsSettings.find(s => s.channelPropertyName === field);
            if (columnSetting) {
                if (columnSetting.width && columnSetting.width !== 1) {
                    return columnSetting.width;
                }
            }
        }
        let maxWidth = calculateSize(headerName, {
            font: "Arial",
            fontSize: "14px",
        }).width + 10;
        tableData.rowsJSON.forEach((item) => {
            var value = item[field];
            if (value instanceof Date) {
                value = value.toLocaleDateString()
            }
            const size = calculateSize(value, {
                font: "Arial",
                fontSize: "14px",
            }); // pass the font properties based on the application
            if (size.width > maxWidth) {
                maxWidth = size.width;
            }
        });
        return maxWidth + 20;
    };

    const setOpenedWindows = (arg, paramName) => {
        let openedCopy = { ...opened };
        openedCopy[paramName] = arg;
        setOpened(openedCopy)
    }

    const getEditorType = (column) => {
        if (inputTableData.properties) {
            const property = _.find(inputTableData.properties, function (o) { return o.name === column.field; });
            if (property && property.secondLevelChannelName) {
                return {
                    type: "secondLevel",
                    secondLevelFormId: formData.id + column.field,
                    channelName: property.secondLevelChannelName,
                    setOpened: (arg) => setOpenedWindows(arg, property.name)
                };
            }
        }
        if (column.lookupData) {
            return {
                type: "lookup",
                values: column.lookupData
            }
        }
        switch (column.netType) {
            case "System.Double":
            case "System.Int32":
            case "System.Int64":
                return {
                    type: "numeric"
                };
            case "System.DateTime":
                return {
                    type: "date"
                };
            default:
                return {
                    type: "string"
                };
        }
    }

    const getFormat = (column) => {
        switch (column.netType) {
            case "System.DateTime":
                return "{0:d}";
            default:
                return null;
        }
    }

    const getFilterByType = (column) => {
        switch (column.netType) {
            case "System.DateTime":
                return "date";
            case "System.Double":
            case "System.Int32":
            case "System.Int64":
                return "numeric";
            default:
                return "text";
        }
    }

    const getColumnMenuByType = (column, props) => {
        if (column.lookupData) {
            let data = column.lookupData.map(ld => {
                return {
                    ...ld,
                    [column.field]: ld.value
                }
            });
            return <ColumnMenuCheckboxFilter {...props} data={data} />;
        }
        return <ColumnMenu {...props} />;
    }

    const applyEdit = React.useCallback(async () => {
        if (edited || rowAdding) {
            const rowToInsert = tableData.rowsJSON.find(item =>
                idGetter(item) === editID
            );
            if (rowToInsert) {
                setEditID(null);
                setEdited(false);

                await apply(rowToInsert, editID, rowAdding);
                if (rowAdding) {
                    setRowAdding(false);
                }
            }
        }
    }, [tableData, edited, editID, rowAdding, apply]);

    const selectAll = () => {
        const newSelectedState = {};
        tableData.rowsJSON.forEach((item) => {
            newSelectedState[idGetter(item)] = true;
        });
        setSelectedState(newSelectedState);
    };

    React.useImperativeHandle(ref, () => ({
        excelExport: excelExport,
        selectAll: selectAll,
        activeCell: () => { return activeCell; }
    }));

    const otherButtons =
        <div>
            <button className="k-button k-button-clear" onClick={excelExport}>
                <span className="k-icon k-i-xls" />
            </button>
            {editable && <button className="k-button k-button-clear" onClick={handleDeleteDialogOpen}>
                <span className="k-icon k-i-minus" />
            </button>}
            {editable && <button className="k-button k-button-clear" onClick={() => addRecord()}>
                <span className="k-icon k-i-plus" />
            </button>}
            {editable && <button className="k-button k-button-clear" onClick={applyEdit} disabled={!edited && !rowAdding}>
                <span className="k-icon k-i-check" />
            </button>}
            {editable && <button className="k-button k-button-clear" onClick={() => { reload(); setEditID(null); }}>
                <span className="k-icon k-i-cancel" />
            </button>}
            <button className="k-button k-button-clear" onClick={reload}>
                <span className="k-icon k-i-reset" />
            </button>
        </div>;

    const enterEdit = (dataItem, field) => {
        const newData = tableData.rowsJSON.map((item) => ({
            ...item,
            [EDIT_FIELD]: idGetter(item) === idGetter(dataItem)
        }));
        setTableData({ rowsJSON: newData, columnsJSON: tableData.columnsJSON });
        setEditField(field);
        setEditID(idGetter(dataItem));
    };

    const exitEdit = () => {
        const newData = tableData.rowsJSON.map((item) => ({ ...item, [EDIT_FIELD]: false }));
        setTableData({ rowsJSON: newData, columnsJSON: tableData.columnsJSON });
        setEditField(undefined);
    };

    const customCellRender = (td, props) => (
        <CellRender
            editable={editable}
            originalProps={props}
            td={td}
            editor={getEditorType(tableData.columnsJSON[props.columnIndex])}
            enterEdit={enterEdit}
            setActiveCell={setActiveCell}
            editField={editField}
        />
    );

    const onColumnResize = (event) => {
        if (tableSettings && tableSettings.columns) {
            event.columns.forEach(c => {
                var columnSetting = tableSettings.columns.columnsSettings.find(s => s.channelPropertyName === c.field);
                if (columnSetting) {
                    columnSetting.width = c.width;
                }
            });
            dispatch(setFormSettings(formData.id, { ...tableSettings }));
        }
    };

    const filterOperators = {
        text: [
            {
                text: "grid.filterContainsOperator",
                operator: "contains",
            },
            {
                text: "grid.filterEqOperator",
                operator: "eq",
            },
            {
                text: "grid.filterNotEqOperator",
                operator: "neq",
            },
            {
                text: "grid.filterStartsWithOperator",
                operator: "startswith",
            },
            {
                text: "grid.filterEndsWithOperator",
                operator: "endswith",
            },
            {
                text: "grid.filterIsNullOperator",
                operator: "isnull",
            },
            {
                text: "grid.filterIsNotNullOperator",
                operator: "isnotnull",
            }
        ],
        numeric: [
            {
                text: "grid.filterEqOperator",
                operator: "eq",
            },
            {
                text: "grid.filterNotEqOperator",
                operator: "neq",
            },
            {
                text: "grid.filterGtOperator",
                operator: "gt",
            },
            {
                text: "grid.filterLtOperator",
                operator: "lt",
            },
            {
                text: "grid.filterGteOperator",
                operator: "gte",
            },
            {
                text: "grid.filterLteOperator",
                operator: "lte",
            },
            {
                text: "grid.filterIsNullOperator",
                operator: "isnull",
            },
            {
                text: "grid.filterIsNotNullOperator",
                operator: "isnotnull",
            }
        ],
        date: [
            {
                text: "grid.filterEqOperator",
                operator: "eq",
            },
            {
                text: "grid.filterNotEqOperator",
                operator: "neq",
            },
            {
                text: "grid.filterAfterOperator",
                operator: "gt",
            },
            {
                text: "grid.filterBeforeOperator",
                operator: "lt",
            },
            {
                text: "grid.filterAfterOrEqualOperator",
                operator: "gte",
            },
            {
                text: "grid.filterBeforeOrEqualOperator",
                operator: "lte",
            },
            {
                text: "grid.filterIsNullOperator",
                operator: "isnull",
            },
            {
                text: "grid.filterIsNotNullOperator",
                operator: "isnotnull",
            }
        ],
        boolean: [
            {
                text: "grid.filterEqOperator",
                operator: "eq",
            },
        ],
    };

    const customRowRender = (tr, props) => (
        <RowRender
            originalProps={props}
            tr={tr}
            exitEdit={exitEdit}
            editField={editField}
        />
    );

    if (tableData.columnsJSON.length > 0) {
        return (
            <LocalizationProvider language="ru-RU">
                <IntlProvider locale="ru">
                    {inputTableData.properties.filter(p => p.secondLevelChannelName).map(p =>
                    (opened[p.name] && <SecondLevelTable
                        key={formData.id + p.name}
                        keyProp={formData.id + p.name}
                        secondLevelFormId={formData.id + p.name}
                        channelName={p.secondLevelChannelName}
                        setOpened={(arg) => setOpenedWindows(arg, p.name)}
                    />
                    ))
                    }
                    {deleteDialogOpen && (
                        <Dialog title={t('table.deleteRowsHeader')} onClose={handleDeleteDialogClose}>
                            <p
                                style={{
                                    margin: "25px",
                                    textAlign: "center",
                                }}
                            >
                                {t('table.areYouSureToDeleteRows', { count: _.countBy(Object.keys(selectedState), o => selectedState[o]).true })}
                            </p>
                            <DialogActionsBar>
                                <Button className="actionbutton" primary={true} onClick={() => { handleDeleteDialogClose(); deleteSelectedRows(); }}>
                                    {t('base.ok')}
                                </Button>
                                <Button className="actionbutton" onClick={handleDeleteDialogClose}>
                                    {t('base.cancel')}
                                </Button>
                            </DialogActionsBar>
                        </Dialog>
                    )}
                    <FormHeader formData={formData} additionalButtons={otherButtons} />
                    <Grid className="grid-content"
                        resizable={true}
                        onColumnResize={onColumnResize}
                        sortable={true}
                        data={dataToShow ? dataToShow.slice(skip, skip + 30) : dataToShow}
                        {...dataState}
                        navigatable={true}
                        onDataStateChange={(e) => {
                            setDataState(e.dataState);
                        }}
                        cellRender={customCellRender}
                        rowRender={customRowRender}
                        onItemChange={onItemChange}
                        dataItemKey={DATA_ITEM_KEY}
                        editField={editable ? EDIT_FIELD : null}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                            enabled: true,
                            drag: true,
                            cell: false,
                            mode: 'multiple'
                        }}
                        onSelectionChange={onSelectionChange}
                        onKeyDown={onKeyDown}
                        rowHeight={15}
                        pageSize={30}
                        total={dataToShow.length}
                        skip={skip}
                        filterOperators={filterOperators}
                        scrollable={"virtual"}
                        onPageChange={pageChange}
                    >
                        {tableData.columnsJSON.map(column => <Column
                            locked={column.locked}
                            key={column.field}
                            field={column.field}
                            title={column.headerName}
                            width={calculateWidth(column.headerName, column.field)}
                            format={getFormat(column)}
                            filter={getFilterByType(column)}
                            columnMenu={(props) => getColumnMenuByType(column, props)}
                        />
                        )}
                    </Grid>
                </IntlProvider>
            </LocalizationProvider>
        );
    }
    else return <div />
}
export default DataSetView = React.forwardRef(DataSetView); // eslint-disable-line