import React from 'react';
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
import { globals } from '../Globals';
import {
    IntlProvider,
    load,
    LocalizationProvider,
    loadMessages,
} from "@progress/kendo-react-intl";
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

export default function TableForm(props) {
    const { t } = useTranslation();
    const { sessionId, formData, globalParameters, ...other } = props;
    const [databaseData, setDatabaseData] = React.useState([]);
    const [rowAdding, setRowAdding] = React.useState(false);
    const [edited, setEdited] = React.useState(false);
    const [neededParamsValues, setNeededParamsValues] = React.useState([]);
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

    const rowClick = (event) => {
        setEditID(idGetter(event.dataItem));
    };

    const closeEdit = (event) => {
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
            idGetter(item) === editedItemID ? { ...item, [event.field]: event.value } : item
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

    React.useEffect(() => {
        let ignore = false;

        async function fetchNewData() {
            const param = _.find(neededParamsValues, function (o) { return o.id === globalParameters.name; });
            if (param) {
                param.value = globalParameters.value;
                let jsonValues = await fetchData(neededParamsValues);
                if (!ignore) {
                    setTableData({
                        rowsJSON: jsonValues.rowsJSON,
                        columnsJSON: jsonValues.columnsJSON
                    });
                }
            }
        }
        fetchNewData();
        return () => { ignore = true; }
    }, [globalParameters, neededParamsValues]);

    React.useEffect(() => {
        let ignore = false;

        async function fetchNeededParamsData() {
            const response = await utils.webFetch(`getAllNeedParametersForForm?sessionId=${sessionId}&clientId=${formData.id}`);
            const responseJSON = await response.json();
            var neededParamsJSON = [];
            globals.globalParameters.forEach(element => {
                responseJSON.forEach(responseParam => {
                    if (element.id === responseParam) {
                        neededParamsJSON.push(element);
                    }
                });
            });
            setNeededParamsValues(neededParamsJSON);
            let jsonValues = await fetchData(neededParamsJSON);
            if (!ignore) {
                setTableData({
                    rowsJSON: jsonValues.rowsJSON,
                    columnsJSON: jsonValues.columnsJSON
                });
            }
        }
        fetchNeededParamsData();
        return () => { ignore = true; }
    }, [sessionId, formData]);

    async function fetchData(neededParamsJSON) {
        const jsonParamaters = JSON.stringify(neededParamsJSON).replaceAll('#', '%23');
        const response = await utils.webFetch(`fill?sessionId=${sessionId}&clientId=${formData.id}&paramValues=${jsonParamaters}`);
        const data = await response.json();
        setDatabaseData(data);

        const columnsJSON = data.data.Columns.map(function (column) {
            const temp = {};
            temp.field = column.Name;
            temp.headerName = column.Name;
            temp.netType = column.NetType;
            const property = _.find(data.properties, function (o) { return o.name === column.Name; });
            if (property) {
                temp.headerName = property.displayName;
            }
            return temp;
        });
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
                    temp[columnsJSON[i].field] = row.Cells[i];
                }
            }
            return temp;
        });
        const result = {};
        result.columnsJSON = columnsJSON;
        result.rowsJSON = rowsJSON;
        return result;
    }

    async function deleteSelectedRows() {
        var elementsToRemove = ',';
        var tableDataCopy = tableData;
        Object.keys(selectedState).forEach(element => {
            if (selectedState[element]) {
                elementsToRemove = elementsToRemove + element + ',';
                const itemToDeleteIndex = tableDataCopy.rowsJSON.findIndex(item =>
                    idGetter(item) == element
                );
                tableDataCopy.rowsJSON.splice(itemToDeleteIndex, 1);
            }
        });
        if (elementsToRemove.length > 1) {
            setTableData({
                rowsJSON: tableDataCopy.rowsJSON,
                columnsJSON: tableDataCopy.columnsJSON
            });
            elementsToRemove = elementsToRemove.slice(1, -1);
            const response = await utils.webFetch(`removeRows?sessionId=${sessionId}&tableId=${databaseData.tableId}&rows=${elementsToRemove}`);
            const data = await response.json();
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
            fontSize: "16px",
        }).width + 10;
        tableData.rowsJSON.forEach((item) => {
            var value = item[field];
            if (value instanceof Date) {
                value = value.toLocaleDateString()
            }
            const size = calculateSize(value, {
                font: "Arial",
                fontSize: "16px",
            }); // pass the font properties based on the application
            if (size.width > maxWidth) {
                maxWidth = size.width;
            }
        });
        return maxWidth + 20;
    };

    const getEditorType = (column) => {
        switch (column.netType) {
            case "System.Int64":
            case "System.Int32":
            case "System.Double":
                return "numeric";
            case "System.DateTime":
                return "date";
            default:
                return "string";
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
            databaseData.data.Columns.forEach(column =>
                cells.push(rowToInsert[column.Name])
            );
            var itemToInsert = { Id: null, Cells: cells };
            const dataJSON = JSON.stringify([itemToInsert]);
            if (rowAdding) {
                const response = await utils.webFetch(`insertRow?sessionId=${sessionId}&tableId=${databaseData.tableId}&rowData=${dataJSON}`);
                const data = await response.json();
                setRowAdding(false);
            }
            else {
                const response = await utils.webFetch(`updateRow?sessionId=${sessionId}&tableId=${databaseData.tableId}&rowsIndices=${editID}&newRowData=${dataJSON}`);
                const data = await response.json();
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
            <button className="k-button k-button-clear">
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
                    <FormHeader sessionId={sessionId} formData={formData} additionalButtons={otherButtons} {...other} />
                    <ExcelExport data={dataToShow.data} ref={_export}>
                        <Grid
                            resizable={true}
                            pageable={true}
                            sortable={true}
                            data={dataToShow}
                            {...dataState}
                            onDataStateChange={(e) => {
                                setDataState(e.dataState);
                            }}
                            onRowDoubleClick={rowClick}
                            onRowClick={closeEdit}
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
                            {tableData.columnsJSON.map(column =>
                                <Column field={column.field} title={column.headerName} width={calculateWidth(column.headerName, column.field)} editor={getEditorType(column)} format={getFormat(column)} columnMenu={GridColumnMenuFilter} />
                            )}
                        </Grid>
                    </ExcelExport>
                </IntlProvider>
            </LocalizationProvider>
        </div>
    );
}
