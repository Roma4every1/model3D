import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Grid,
    GridColumn as Column,
    getSelectedState,
    getSelectedStateFromKeyDown,
    GridColumnMenuFilter
} from "@progress/kendo-react-grid";
import ColumnMenu from "./ColumnMenu";
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
import filterOperators from "./filterOperators.json";
import filterOperations from "./filterOperations.json";
import addParam from "../../../store/actionCreators/addParam";
import addParamSet from "../../../store/actionCreators/addParamSet";
import setOpenedWindow from "../../../store/actionCreators/setOpenedWindow";
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
    const [columnGroupingData, setColumnGroupingData] = React.useState([]);
    const [tableData, setTableData] = React.useState({
        rowsJSON: [],
        columnsJSON: []
    });
    const [dataState, setDataState] = React.useState({
        skip: 0,
        take: 100
    });
    const [editField, setEditField] = React.useState(undefined);
    const [editID, setEditID] = React.useState(null);
    const [selectedState, setRealSelectedState] = React.useState({});
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

    const tableSettings = useSelector((state) => state.formSettings[formData.id]);
    const tableColumnGroupSettings = useSelector((state) => state.formSettings[formData.id]?.columns?.ColumnGroupSettings);

    var selectedStateChanged = React.useRef(false);
    const setSelectedState = (newValue) => {
        selectedStateChanged.current = true;
        setRealSelectedState(newValue);
    }

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
                        const property = inputTableData.properties.find(o => o.name === el.field);
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
                        if (filterOperations[filter.operator]) {
                            operation = filterOperations[filter.operator];
                        }
                        let center = "";
                        let fieldFilter = filter.value;
                        if (col.lookupData) {
                            fieldFilter = col.lookupData.find(ld => ld.value === fieldFilter).id;
                        }
                        else switch (col.netType) {
                            case "System.DateTime":
                                if (typeof fieldFilter === 'string') {
                                    var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
                                    fieldFilter = new Date(fieldFilter.replace(pattern, '$3/$2/$1'));
                                    filter.value = fieldFilter;
                                }
                                break;
                            case "System.Decimal":
                            case "System.Double":
                            case "System.Int32":
                            case "System.Int64":
                                if (typeof fieldFilter === 'string') {
                                    fieldFilter = Number(fieldFilter.replace(',', '.'));
                                }
                                break;
                            default:
                                break;
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

    const onDataStateChange = (event) => {
        setDataState(event.dataState);
        if (dataPart && (dataToShow.length < event.dataState.skip + event.dataState.take * 2)) {
            sessionManager.paramsManager.updateParamValue(activeChannelName, "maxRowCount", dataToShow.length + addRowCount, true);
        }
    };

    const handleDeleteDialogOpen = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
    };

    const addRecord = async (existingRecord) => {
        var copy = true;
        var toEnd = false;
        var index = Infinity;
        if (Object.entries(selectedState).length > 0) {
            index = Math.min(Object.entries(selectedState).filter(e => e[1] === true).map(e => e[0]), Infinity);
        }
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
        if (toEnd) {
            setTableData({ rowsJSON: [...tableData.rowsJSON, newRecord], columnsJSON: tableData.columnsJSON });
        }
        else if (!toEnd) {
            var startPart = tableData.rowsJSON.slice(0, index);
            var finishPart = tableData.rowsJSON.slice(index);
            setTableData({ rowsJSON: [...startPart, newRecord, ...finishPart], columnsJSON: tableData.columnsJSON });
        }
        setEditID(idGetter(newRecord));
        setRowAdding(true);
    };

    const excelExport = async () => {
        const dataD = sessionManager.channelsManager.getAllChannelParams(activeChannelName);
        var neededParamValues = sessionManager.paramsManager.getParameterValues(dataD, formData.id, false, activeChannelName);
        var settings = tableSettings?.columns;
        if (settings) {
            settings = { ...settings, columnsSettings: settings.columnsSettings.map(c => { return { ...c, isVisible: tableData.columnsJSON.some(cc => cc.field === c.channelPropertyName) } }) };
        }
        var jsonToSend = {
            sessionId: sessionId,
            channelName: activeChannelName,
            paramName: formData.displayName,
            presentationId: utils.getParentFormId(formData.id),
            paramValues: neededParamValues,
            settings: settings
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
                if (editable && !rowAdding) {
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
                if (!event?.syntheticEvent?.target?.form?.className?.includes('filter')) {
                    if (editable && !(editID != null && editField) && _.countBy(Object.keys(selectedState), o => selectedState[o]).true > 0) {
                        handleDeleteDialogOpen();
                    }
                }
                break;
            }
            case 'Enter': {
                if (deleteDialogOpen) {
                    event.nativeEvent.preventDefault();
                    handleDeleteDialogClose();
                    deleteSelectedRows();
                }
                else if (edited) {
                    applyEdit();
                }
                break;
            }
            case 'Home': {
                if (event.nativeEvent.ctrlKey) {
                    if (tableData.rowsJSON.length > 0) {
                        setDataState({ ...dataState, skip: 0 });
                        _ref.current.element.children[1].children[0].scrollTop = 0;
                        setSelectedState({ 0: true });
                        applyEdit();
                        setEditID(null);
                        event.nativeEvent.preventDefault();
                    }
                }
                break;
            }
            case 'End': {
                if (event.nativeEvent.ctrlKey) {
                    if (tableData.rowsJSON.length > 0) {
                        let rowIndex = tableData.rowsJSON.length - 1;
                        //_ref.current.element.children[1].children[0].scrollTop = _ref.current.element.children[1].children[0].scrollHeight;
                        setDataState({ ...dataState, skip: rowIndex - 20 > 0 ? rowIndex - 20 : 0 });
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
                            addRecord(true);
                        }
                        else {
                            addRecord(false);
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
        if (selectedStateChanged.current && inputTableData.currentRowObjectName) {
            selectedStateChanged.current = false;
            if (Object.entries(selectedState).filter(e => e[1] === true).length === 1) {
                let row = Object.entries(selectedState).find(e => e[1] === true);
                sessionManager.paramsManager.updateParamValue(utils.getParentFormId(formData.id), inputTableData.currentRowObjectName, utils.tableRowToString(inputTableData.databaseData, inputTableData.databaseData.data.Rows[row[0]])?.value, true);
            }
        }
    }, [selectedState, inputTableData, sessionManager, formData]);

    React.useEffect(() => {
        setSelectedState({});
    }, [inputTableData]);

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
        var selectedRows = Object.keys(selectedState).filter(element => selectedState[element]);
        if (selectedRows.length === tableData.rowsJSON.length) {
            await deleteRows(elementsToRemove, true);
        }
        else if (selectedRows.length > 0) {
            selectedRows.forEach(element => {
                elementsToRemove = elementsToRemove + element + ',';
                const itemToDeleteIndex = tableDataCopy.rowsJSON.findIndex(item =>
                    String(idGetter(item)) === String(element)
                );
                if (itemToDeleteIndex !== -1) {
                    tableDataCopy.rowsJSON.splice(itemToDeleteIndex, 1);
                }
            });
            setTableData({
                rowsJSON: tableDataCopy.rowsJSON,
                columnsJSON: tableDataCopy.columnsJSON
            });
            elementsToRemove = elementsToRemove.slice(1, -1);
            await deleteRows(elementsToRemove);
        }
    };

    var dataToShow = tableData.rowsJSON;
    dataToShow = dataToShow.map((item) => ({
        ...item,
        [SELECTED_FIELD]: selectedState[idGetter(item)],
        [EDIT_FIELD]: idGetter(item) === editID
    }));

    const getEditorType = (column) => {
        if (!column) {
            return "string";
        }
        var result = {};
        if (inputTableData.properties) {
            const property = inputTableData.properties.find(o => o.name === column.field);
            if (property && property.secondLevelChannelName) {
                result.setOpened = (arg) => dispatch(setOpenedWindow(property.name, arg, <SecondLevelTable
                    key={formData.id + property.name}
                    keyProp={formData.id + property.name}
                    secondLevelFormId={formData.id + property.name}
                    channelName={property.secondLevelChannelName}
                    setOpened={(arg) =>
                        dispatch(setOpenedWindow(property.name, arg, null))
                    }
                />))
            };
        }
        if (column.lookupData) {
            result.type = "lookup";
            result.values = column.lookupData;
        }
        else {
            switch (column.netType) {
                case "System.Decimal":
                case "System.Double":
                case "System.Int32":
                case "System.Int64":
                    result.type = "numeric";
                    break;
                case "System.DateTime":
                    result.type = "date";
                    break;
                default:
                    result.type = "string";
            }
        }
        return result;
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
            case "System.Decimal":
            case "System.Double":
            case "System.Int32":
            case "System.Int64":
                return "numeric";
            default:
                return "text";
        }
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
            {editable && <button className="k-button k-button-clear" onClick={() => addRecord()} disabled={rowAdding}>
                <span className="k-icon k-i-plus" />
            </button>}
            {editable && <button className="k-button k-button-clear" onClick={applyEdit} disabled={!edited && !rowAdding}>
                <span className="k-icon k-i-check" />
            </button>}
            {editable && <button className="k-button k-button-clear" onClick={() => { reload(); setEditID(null); setRowAdding(false); }}>
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
            editor={getEditorType(tableData.columnsJSON.find(col => col.field === props.field))}
            enterEdit={enterEdit}
            setActiveCell={setActiveCell}
            editField={editField}
        />
    );

    const onColumnResize = (event) => {
        const setWidth = c => {
            var columnSetting = tableSettings.columns.columnsSettings.find(s => s.channelPropertyName === c.field);
            if (columnSetting) {
                columnSetting.width = c.width;
            }
            if (c.children) {
                c.children.forEach(cc => {
                    setWidth(cc);
                });
            }
        }
        if (tableSettings && tableSettings.columns) {
            event.columns.forEach(c => {
                setWidth(c);
            });
            dispatch(setFormSettings(formData.id, { ...tableSettings }));
        }
    };

    const customRowRender = (tr, props) => (
        <RowRender
            originalProps={props}
            tr={tr}
            exitEdit={exitEdit}
            editField={editField}
        />
    );

    const _ref = React.useRef();

    const drawColumn = React.useCallback(column => {

        const calculateWidth = (headerName, field, columnSetting) => {
            if (columnSetting) {
                if (columnSetting.width && columnSetting.width !== 1) {
                    return columnSetting.width;
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

        var columnSetting = null;
        var header = column.headerName;
        if (tableSettings && tableSettings.columns) {
            columnSetting = tableSettings.columns.columnsSettings.find(s => s.channelPropertyName === column.field);
        }
        if (columnSetting?.displayName || columnSetting?.calculatedDisplayName) {
            header = columnSetting?.calculatedDisplayName ?? columnSetting?.displayName;
        }

        return <Column
            headerClassName={GridColumnMenuFilter.active(column.field, dataState.filter) ? "active" : ""}
            locked={column.locked}
            key={column.field}
            field={column.field}
            title={header}
            width={calculateWidth(header, column.field, columnSetting)}
            format={getFormat(column)}
            filter={getFilterByType(column)}
            columnMenu={(props) => <ColumnMenu
                {...props}
                tableColumn={column}
                formId={formData.id}
                activeChannelName={activeChannelName}
            />}
        />
    }, [tableSettings, tableData, dataState, activeChannelName, formData]);

    React.useEffect(() => {
        var groupingData = [];
        tableData.columnsJSON.forEach(col => {
            if (!col.treePath || col.treePath.length === 0) {
                groupingData.push(drawColumn(col));
            }
            else {
                var parent = null;
                col.treePath.forEach(part => {
                    var trimPart = part.trim();
                    var parentArray = parent?.props?.children ?? groupingData;
                    parent = parentArray.find(p => p?.key === trimPart);
                    var columnSetting = tableColumnGroupSettings?.find(setting => setting.columnGroupName === trimPart);
                    if (!parent) {
                        var children = [];
                        parent = <Column
                            key={trimPart}
                            title={columnSetting?.calculatedDisplayName ?? (columnSetting?.columnGroupDisplayName ?? trimPart)}
                            children={children}>
                        </Column>;
                        parentArray.push(parent);
                    }
                });
                parent.props.children.push(drawColumn(col))
            }
        });
        setColumnGroupingData(groupingData);
    }, [tableData, drawColumn, tableColumnGroupSettings]);

    if (columnGroupingData.length > 0) {
        return (
            <LocalizationProvider language="ru-RU">
                <IntlProvider locale="ru">
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
                    <Grid ref={_ref} className="grid-content"
                        resizable={true}
                        onColumnResize={onColumnResize}
                        sortable={true}
                        data={dataToShow ? dataToShow.slice(dataState.skip, dataState.skip + dataState.take) : dataToShow}
                        {...dataState}
                        navigatable={true}
                        onDataStateChange={onDataStateChange}
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
                        filterOperators={filterOperators}
                        scrollable={"virtual"}
                    >
                        {columnGroupingData}
                    </Grid>
                </IntlProvider>
            </LocalizationProvider>
        );
    }
    else return <div />
}
export default DataSetView = React.forwardRef(DataSetView); // eslint-disable-line