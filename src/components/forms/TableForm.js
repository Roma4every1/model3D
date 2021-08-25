import React from 'react';
import {
    Grid,
    GridColumn as Column,
    GridColumnMenuFilter,
    getSelectedState,
    getSelectedStateFromKeyDown
} from "@progress/kendo-react-grid";
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
import { getter } from "@progress/kendo-react-common";
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
    const { sessionId, formData, globalParameters, ...other } = props;
    const [databaseData, setDatabaseData] = React.useState([]);
    const [neededParamsValues, setNeededParamsValues] = React.useState([]);
    const [tableData, setTableData] = React.useState({
        rowsJSON: [],
        columnsJSON: []
    });
    const [dataState, setDataState] = React.useState();
    const [editID, setEditID] = React.useState(null);
    const [selectedState, setSelectedState] = React.useState({});
    const _export = React.useRef(null);

    const rowClick = (event) => {
        setEditID(idGetter(event.dataItem));
    };

    const closeEdit = (event) => {
        if (event.target === event.currentTarget) {
            setEditID(null);
        }
    };

    const addRecord = () => {
        const newRecord = {
            [DATA_ITEM_KEY]: tableData.rowsJSON.length + 1,
        };
        setTableData({ rowsJSON: [...tableData.rowsJSON, newRecord], columnsJSON: tableData.columnsJSON });
        setEditID(idGetter(newRecord));
    };

    const excelExport = () => {
        if (_export.current !== null) {
            _export.current.save();
        }
    };

    const onItemChange = (event) => {
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
                setDataState({
                    sort: [
                        {
                            field: jsonValues.columnsJSON[0].field,
                            dir: "asc",
                        },
                    ],
                    take: 10,
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
                    temp[columnsJSON[i].field] = d.toLocaleDateString();
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
        Object.keys(selectedState).forEach(async element => {
            if (selectedState[element]) {
                const response = await utils.webFetch(`removeRows?sessionId=${sessionId}&tableId=${databaseData.tableId}&rows=${element}`);
                const data = await response.json();
            }
        });
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
            const size = calculateSize(item[field], {
                font: "Arial",
                fontSize: "16px",
            }); // pass the font properties based on the application
            if (size.width > maxWidth) {
                maxWidth = size.width;
            }
        });
        return maxWidth + 20;
    };

    const otherButtons =
        <div>
            <button className="k-button k-button-clear" onClick={excelExport}>
                <span className="k-icon k-i-xls" />
            </button>
            <button className="k-button k-button-clear" onClick={deleteSelectedRows}>
                <span className="k-icon k-i-table-row-delete" />
            </button>
            <button className="k-button k-button-clear" onClick={addRecord}>
                <span className="k-icon k-i-table-row-insert-above" />
            </button>
        </div>;

    return (
        <div>
            <LocalizationProvider language="ru-RU">
                <IntlProvider locale="ru">
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
                            {tableData.columnsJSON.map(column =>
                                <Column field={column.field} title={column.headerName} width={calculateWidth(column.headerName, column.field)} editor="text" columnMenu={GridColumnMenuFilter} />
                            )}
                        </Grid>
                    </ExcelExport>
                </IntlProvider>
            </LocalizationProvider>
        </div>
    );
}
