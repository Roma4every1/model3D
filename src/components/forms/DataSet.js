import React from 'react';
import { useSelector } from 'react-redux';
import DataSetView from "./DataSet/DataSetView";
var _ = require("lodash");

export default function DataSet(props) {
    const sessionManager = useSelector((state) => state.sessionManager);
    const { formData, channels } = props;
    const [activeChannelName] = React.useState(channels[0]);

    const reload = React.useCallback(async () => {
        await sessionManager.channelsManager.loadAllChannelData(activeChannelName, formData.id, true);
    }, [activeChannelName, formData, sessionManager]);

    const databaseData = useSelector((state) => state.channelsData[activeChannelName]);

    var columnsJSON = [];
    var rowsJSON = [];
    if (databaseData && databaseData.data) {
        columnsJSON = databaseData.data.Columns.map(function (column) {
            const temp = {};
            temp.field = column.Name;
            temp.headerName = column.Name;
            temp.netType = column.NetType;
            const property = _.find(databaseData.properties, function (o) { return o.fromColumn === column.Name; });
            if (property) {
                temp.headerName = property.displayName;
                temp.lookupChannelName = property.lookupChannelName;
                temp.lookupData = property.lookupData;
            }
            return temp;
        });

        rowsJSON = databaseData.data.Rows.map(function (row, rowIndex) {
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
    }

    var tableData = {
        rowsJSON: rowsJSON,
        columnsJSON: columnsJSON
    };

    async function deleteRows(elementsToRemove) {
        await sessionManager.channelsManager.deleteRow(databaseData.tableId, elementsToRemove);
    }

    async function apply(editedTableData, rowToInsert, editID, rowAdding) {
        var cells = [];
        databaseData.data.Columns.forEach(column => {
            const datacolumn = editedTableData.columnsJSON.find((c) => c.field === column.Name)
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
            await sessionManager.channelsManager.insertRow(databaseData.tableId, dataJSON);
        }
        else {
            await sessionManager.channelsManager.updateRow(databaseData.tableId, editID, [itemToInsert]);
        }
    }

    return (
        <div>
            <DataSetView inputTableData={tableData} formData={formData} apply={apply} deleteRows={deleteRows} reload={reload} />
        </div>
    );
}
