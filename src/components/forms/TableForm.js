import React from 'react';
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { globals } from '../Globals';
var _ = require("lodash");
var utils = require("../../utils")

export default function TableForm(props) {
    const { sessionId, formId } = props;
    const [tableData, setTableData] = React.useState({
        rowsJSON: [],
        columnsJSON: []
    });

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
        const jsonParamaters = JSON.stringify(neededParamsJSON);
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

            <Grid
                style={{
                    height: "400px",
                }}
                sortable={true}
                data={tableData.rowsJSON}
            >
                {tableData.columnsJSON.map(column => 
                    <Column field={column.field} title={column.headerName} width="100px" />
                    
                    )}
            </Grid>
        </div>
    );
}
