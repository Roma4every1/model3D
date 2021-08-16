import React from 'react';
import { DataGrid } from '@material-ui/data-grid';
var utils = require("../../utils")

export default function TableForm(props) {
    const { sessionId, filterValue } = props;
    const [tableData, setTableData] = React.useState({
        rowsJSON: [],
        columnsJSON: []
    });

    React.useEffect(() => {
        let ignore = false;

        async function fetchData() {
            var response;
            if (filterValue) {
                response = await utils.webFetch(`fill?sessionId=${sessionId}&filterValue=${filterValue}`);
            }
            else {
                response = await utils.webFetch(`fill?sessionId=${sessionId}`);
            }
            const data = await response.json();

            const columnsJSON = data.Columns.map(function (column) {
                const temp = {};
                temp.field = column.Name;
                temp.headerName = column.Name;
                return temp;
            });
            const rowsJSON = data.Rows.map(function (row, rowIndex) {
                const temp = {};
                temp.id = rowIndex;
                for (var i = 0; i < columnsJSON.length; i++) {
                    temp[columnsJSON[i].field] = row.Cells[i];
                }
                return temp;
            });
            if (!ignore) {
                setTableData({
                    rowsJSON: rowsJSON,
                    columnsJSON: columnsJSON
                });
            }
        }
        fetchData();
        return () => { ignore = true; }
    }, [sessionId, filterValue]);

    return (
        <div style={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={tableData.rowsJSON}
                columns={tableData.columnsJSON}
                pageSize={5}
                disableSelectionOnClick
            />
        </div>
    );
}
