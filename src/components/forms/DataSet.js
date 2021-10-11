import React from 'react';
import { useSelector } from 'react-redux'
import {
    Grid,
    GridColumn as Column,
    GridColumnMenuFilter,
    getSelectedState,
    getSelectedStateFromKeyDown
} from "@progress/kendo-react-grid";
import {
    Button
} from "@progress/kendo-react-buttons";
import {
    IntlProvider,
    load,
    LocalizationProvider,
    loadMessages,
} from "@progress/kendo-react-intl";
import { BaseCell } from "./DataSet/Cells/BaseCell";
import { ExcelExport } from '@progress/kendo-react-excel-export';
import { process } from "@progress/kendo-data-query";
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
import FormHeader from '../FormHeader';
import ruMessages from "./ru.json";
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
var _ = require("lodash");
var utils = require("../../utils");
const DATA_ITEM_KEY = "js_id";
const SELECTED_FIELD = "js_selected";
const EDIT_FIELD = "js_inEdit";
const idGetter = getter(DATA_ITEM_KEY);

export default function DataSet(props) {
    const sessionManager = useSelector((state) => state.sessionManager);
    const sessionId = useSelector((state) => state.sessionId);
    const { t } = useTranslation();
    const { formData, changedParameter, modifiedTables, formId, ...other } = props;
    const [databaseData, setDatabaseData] = React.useState([]);
    const [activeChannelName, setActiveChannelName] = React.useState('');
    const [rowAdding, setRowAdding] = React.useState(false);
    const [edited, setEdited] = React.useState(false);
    const [neededParamsValues, setNeededParamsValues] = React.useState({
        values: [],
        loaded: false
    });
    const [tableData, setTableData] = React.useState({
        rowsJSON: [],
        columnsJSON: []
    });
    const [dataState, setDataState] = React.useState();
    const [editID, setEditID] = React.useState(null);
    const [selectedState, setSelectedState] = React.useState({});
    const _export = React.useRef(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

    const handleDeleteDialogOpen = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
    };

    const rowDoubleClick = (event) => {
        setEditID(idGetter(event.dataItem));
    };

    const rowClick = (event) => {
        if (edited) {
            applyEdit();
        }
        setEditID(null);
    };

    const addRecord = () => {
        const newRecord = {
            [DATA_ITEM_KEY]: tableData.rowsJSON.length + 1,
        };
        setTableData({ rowsJSON: [...tableData.rowsJSON, newRecord], columnsJSON: tableData.columnsJSON });
        setEditID(idGetter(newRecord));
        setRowAdding(true);
    };

    const excelExport = () => {
        if (_export.current !== null) {
            _export.current.save();
        }
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
        setSelectedState(newSelectedState);
    };

    const onKeyDown = (event) => {
        const newSelectedState = getSelectedStateFromKeyDown({
            event,
            selectedState: selectedState,
            dataItemKey: DATA_ITEM_KEY,
        });
        setSelectedState(newSelectedState);
    };

    const fetchData = React.useCallback(async (neededParamsJSON) => {
        async function fetchLookupData(columnElement) {
            const responseJSON = await sessionManager.channelsManager.loadChannelParamsList(columnElement.lookupChannelName);
            var neededParamsJSON = sessionManager.paramsManager.getParameterValues(responseJSON, formId);
            const response2JSON = await sessionManager.channelsManager.loadChannelData(columnElement.lookupChannelName, neededParamsJSON);
            let valuesFromJSON = '';
            if (response2JSON && response2JSON.data) {
                let idIndex = 0;
                let nameIndex = 0;
                if (response2JSON.properties) {
                    response2JSON.properties.forEach(property => {
                        if (property.name.toUpperCase() === 'LOOKUPCODE') {
                            idIndex = _.findIndex(response2JSON.data.Columns, function (o) { return o.Name === property.fromColumn; });
                        }
                        else if (property.name.toUpperCase() === 'LOOKUPVALUE') {
                            nameIndex = _.findIndex(response2JSON.data.Columns, function (o) { return o.Name === property.fromColumn; });
                        }
                    });
                }
                valuesFromJSON = response2JSON.data.Rows.map((row) => {
                    let temp = {};
                    temp.id = row.Cells[idIndex];
                    temp.value = row.Cells[nameIndex];
                    temp.text = row.Cells[nameIndex];
                    return temp;
                });
            }
            columnElement.lookupData = valuesFromJSON;
        }
        const data = await sessionManager.channelsManager.loadChannelData(activeChannelName, neededParamsJSON);

        setDatabaseData(data);

        if (data.data) {
            const columnsJSON = await Promise.all(data.data.Columns.map(async function (column) {
                const temp = {};
                temp.field = column.Name;
                temp.headerName = column.Name;
                temp.netType = column.NetType;
                const property = _.find(data.properties, function (o) { return o.fromColumn === column.Name; });
                if (property) {
                    temp.headerName = property.displayName;
                    temp.lookupChannelName = property.lookupChannelName;
                    if (property.lookupChannelName) {
                        await fetchLookupData(temp);
                    }
                }
                return temp;
            }));

            const rowsJSON = data.data.Rows.map(function (row, rowIndex) {
                const temp = {};
                temp.js_id = rowIndex;
                for (var i = 0; i < columnsJSON.length; i++) {
                    if (columnsJSON[i].netType === 'System.DateTime' && row.Cells[i]) {
                        const startIndex = row.Cells[i].indexOf('(');
                        const finishIndex = row.Cells[i].lastIndexOf('+');
                        const dateValue = row.Cells[i].slice(startIndex + 1, finishIndex);
                        var d = new Date();
                        d.setTime(dateValue);
                        temp[columnsJSON[i].field] = d;
                    }
                    else {
                        if (columnsJSON[i].lookupData) {
                            const prevalue = row.Cells[i];
                            const textvalue = columnsJSON[i].lookupData.find((c) => c.id === prevalue)?.text;
                            temp[columnsJSON[i].field] = textvalue;
                            temp[columnsJSON[i].field + '_jsoriginal'] = row.Cells[i];
                        }
                        else {
                            temp[columnsJSON[i].field] = row.Cells[i];
                        }
                    }
                }
                return temp;
            });
            const result = {};
            result.columnsJSON = columnsJSON;
            result.rowsJSON = rowsJSON;
            return result;
        }
        else {
            const result = {};
            result.columnsJSON = [];
            result.rowsJSON = [];
            return result;
        }
    }, [formId, activeChannelName, sessionManager]);

    const reload = React.useCallback(async () => {
        let jsonValues = await fetchData(neededParamsValues.values);
        setTableData({
            rowsJSON: jsonValues.rowsJSON,
            columnsJSON: jsonValues.columnsJSON
        });
    }, [fetchData, neededParamsValues]);

    React.useEffect(() => {
        if (modifiedTables?.includes(databaseData.tableId)) {
            reload();
        }
    }, [modifiedTables, databaseData, reload]);

    //React.useEffect(() => {
    //    let ignore = false;

    //    async function fetchNewData() {
    //        var param = _.find(neededParamsValues.values, function (o) { return o.id === changedParameter.name; });
    //        if (param) {
    //            if (!param.type) {
    //                var element = _.find(globals.presentationParameters[formId], function (o) { return o.id === param.id; });
    //                if (element) {
    //                    param = element
    //                }
    //            }
    //            param.value = changedParameter.value;
    //            let jsonValues = await fetchData(neededParamsValues.values);
    //            if (!ignore) {
    //                setTableData({
    //                    rowsJSON: jsonValues.rowsJSON,
    //                    columnsJSON: jsonValues.columnsJSON
    //                });
    //            }
    //        }
    //    }
    //    if (neededParamsValues.loaded) {
    //        fetchNewData();
    //    }
    //    return () => { ignore = true; }
    //}, [changedParameter, formId, neededParamsValues, fetchData]);

    React.useEffect(() => {
        let ignore = false;

        async function fetchNeededParamsData() {
            const channels = await sessionManager.channelsManager.loadFormChannelsList(formData.id);
            setActiveChannelName(channels[0]);
            const params = await sessionManager.channelsManager.loadChannelParamsList(channels[0]);
            var neededParamsJSON = sessionManager.paramsManager.getParameterValues(params, formId);
            setNeededParamsValues({ values: neededParamsJSON, loaded: true });
            let jsonValues = await fetchData(neededParamsJSON);
            if (!ignore) {
                setDataState({
                    sort: [
                    ],
                    skip: 0,
                });

                setTableData({
                    rowsJSON: jsonValues.rowsJSON,
                    columnsJSON: jsonValues.columnsJSON
                });
            }
        }
        fetchNeededParamsData();
        return () => { ignore = true; }
    }, [formData, formId, fetchData, sessionManager]);

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
            const response = await utils.webFetch(`removeRows?sessionId=${sessionId}&tableId=${databaseData.tableId}&rows=${elementsToRemove}`);
            await response.json();
        }
    };

    var dataToShow = tableData.rowsJSON;
    dataToShow = dataToShow.map((item) => ({
        ...item,
        [SELECTED_FIELD]: selectedState[idGetter(item)],
        [EDIT_FIELD]: idGetter(item) === editID
    }));

    if (dataState) {
        dataToShow = process(dataToShow, dataState);
    }

    const calculateWidth = (headerName, field) => {
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

    const getEditorType = (column) => {
        if (column.lookupData) {
            return {
                type: "lookup",
                value: column.lookupData
            }
        }
        switch (column.netType) {
            case "System.Int64":
            case "System.Int32":
            case "System.Double":
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

    async function applyEdit() {
        const rowToInsert = tableData.rowsJSON.find(item =>
            idGetter(item) === editID
        );
        if (rowToInsert) {
            setEditID(null);
            setEdited(false);
            var cells = [];
            databaseData.data.Columns.forEach(column => {
                const datacolumn = tableData.columnsJSON.find((c) => c.field === column.Name)
                if (datacolumn.lookupData) {
                    return cells.push(rowToInsert[column.Name + '_jsoriginal'])
                }
                else {
                    return cells.push(rowToInsert[column.Name])
                }
            });
            var itemToInsert = { Id: null, Cells: cells };
            const dataJSON = JSON.stringify([itemToInsert]);
            if (rowAdding) {
                const response = await utils.webFetch(`insertRow?sessionId=${sessionId}&tableId=${databaseData.tableId}&rowData=${dataJSON}`);
                await response.json();
                setRowAdding(false);
            }
            else {
                var jsonToSend = { sessionId: sessionId, tableId: databaseData.tableId, rowsIndices: editID, newRowData: [itemToInsert] };
                const jsonToSendString = JSON.stringify(jsonToSend);
                const response = await utils.webFetch(`updateRow`,
                    {
                        method: 'POST',
                        body: jsonToSendString
                    });
                await response.text();
            }
        }
    };

    const otherButtons =
        <div>
            <button className="k-button k-button-clear" onClick={excelExport}>
                <span className="k-icon k-i-xls" />
            </button>
            <button className="k-button k-button-clear" onClick={handleDeleteDialogOpen}>
                <span className="k-icon k-i-minus" />
            </button>
            <button className="k-button k-button-clear" onClick={addRecord}>
                <span className="k-icon k-i-plus" />
            </button>
            <button className="k-button k-button-clear" onClick={applyEdit} disabled={!edited}>
                <span className="k-icon k-i-check" />
            </button>
            <button className="k-button k-button-clear">
                <span className="k-icon k-i-cancel" />
            </button>
            <button className="k-button k-button-clear" onClick={reload}>
                <span className="k-icon k-i-reset" />
            </button>
        </div>;

    return (
        <div>
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
                    <FormHeader formData={formData} additionalButtons={otherButtons} {...other} />
                    <ExcelExport data={dataToShow.data} ref={_export}>
                        <Grid
                            resizable={true}
                            sortable={true}
                            data={dataToShow}
                            {...dataState}
                            onDataStateChange={(e) => {
                                setDataState(e.dataState);
                            }}
                            onRowDoubleClick={rowDoubleClick}
                            onRowClick={rowClick}
                            onItemChange={onItemChange}
                            dataItemKey={DATA_ITEM_KEY}
                            editField={EDIT_FIELD}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                                enabled: true
                            }}
                            onSelectionChange={onSelectionChange}
                            onKeyDown={onKeyDown}
                        >
                            {tableData.columnsJSON.map(column => <Column
                                key={column.field}
                                field={column.field}
                                title={column.headerName}
                                width={calculateWidth(column.headerName, column.field)}
                                editor={getEditorType(column)}
                                format={getFormat(column)}
                                cell={BaseCell}
                                columnMenu={GridColumnMenuFilter}
                            />
                            )}
                        </Grid>
                    </ExcelExport>
                </IntlProvider>
            </LocalizationProvider>
        </div>
    );
}
