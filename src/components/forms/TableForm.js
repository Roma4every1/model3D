import React from 'react';
import { Grid, GridColumn as Column, GridColumnMenuFilter } from "@progress/kendo-react-grid";
import { globals } from '../Globals';
import {
    IntlProvider,
    load,
    LocalizationProvider,
    loadMessages,
} from "@progress/kendo-react-intl";
import likelySubtags from "cldr-core/supplemental/likelySubtags.json";
import currencyData from "cldr-core/supplemental/currencyData.json";
import weekData from "cldr-core/supplemental/weekData.json";
import numbers from "cldr-numbers-full/main/ru/numbers.json";
import currencies from "cldr-numbers-full/main/ru/currencies.json";
import caGregorian from "cldr-dates-full/main/ru/ca-gregorian.json";
import dateFields from "cldr-dates-full/main/ru/dateFields.json";
import timeZoneNames from "cldr-dates-full/main/ru/timeZoneNames.json";
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
var utils = require("../../utils")

export default function TableForm(props) {
    const { sessionId, formId, globalParameters } = props;
    const [neededParamsValues, setNeededParamsValues] = React.useState([]);
    const [tableData, setTableData] = React.useState({
        rowsJSON: [],
        columnsJSON: []
    });
    const [sort, setSort] = React.useState();

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
            const response = await utils.webFetch(`getAllNeedParametersForForm?sessionId=${sessionId}&clientId=${formId}`);
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
    }, [sessionId, formId]);

    async function fetchData(neededParamsJSON) {
        const jsonParamaters = JSON.stringify(neededParamsJSON).replaceAll('#', '%23');
        const response = await utils.webFetch(`fill?sessionId=${sessionId}&clientId=${formId}&paramValues=${jsonParamaters}`);
        const data = await response.json();

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
            temp.id = rowIndex;
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

    return (
        <div>

            <LocalizationProvider language="ru-RU">
                <IntlProvider locale="ru">
                    <Grid
                        pageable={true}
                        sortable={true}
                        data={tableData.rowsJSON}
                        sort={sort}
                        onSortChange={(e) => {
                            setSort(e.sort);
                        }}
                    >
                        {tableData.columnsJSON.map(column =>
                            <Column field={column.field} title={column.headerName} width="100px" filter={"numeric"} columnMenu={GridColumnMenuFilter} />
                        )}
                    </Grid>
                </IntlProvider>
            </LocalizationProvider>
        </div>
    );
}
