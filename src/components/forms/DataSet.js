import React from 'react';
import { useSelector } from 'react-redux';
import DataSetView from "./DataSet/DataSetView";
var _ = require("lodash");
var utils = require("../../utils");

export default function DataSet(props) {
    const sessionManager = useSelector((state) => state.sessionManager);
    const sessionId = useSelector((state) => state.sessionId);
    const { formData, formId } = props;
    const [activeChannelName, setActiveChannelName] = React.useState('');

    //const reload = React.useCallback(async () => {
    //    let jsonValues = await fetchData(neededParamsValues.values);
    //    setTableData({
    //        rowsJSON: jsonValues.rowsJSON,
    //        columnsJSON: jsonValues.columnsJSON
    //    });
    //}, [fetchData, neededParamsValues]);

    React.useEffect(() => {
        let ignore = false;

        async function getActiveChannelName() {
            const channels = await sessionManager.channelsManager.loadFormChannelsList(formData.id);
            if (!ignore) {
                setActiveChannelName(channels[0]);
            }
        }
        getActiveChannelName();
        return () => { ignore = true; }
    }, [formData, sessionManager]);

    const databaseData = useSelector((state) => state.sessionManager.channelsManager.getChannelData(activeChannelName, formId ?? ''));

    var columnsJSON = [];
    var rowsJSON = [];
    if (databaseData && databaseData.data) {
        //async function fetchLookupData(columnElement) {
        //    const responseJSON = await sessionManager.channelsManager.loadChannelParamsList(columnElement.lookupChannelName);
        //    var neededParamsJSON = sessionManager.paramsManager.getParameterValues(responseJSON, formId);
        //    const response2JSON = await sessionManager.channelsManager.loadChannelData(columnElement.lookupChannelName, neededParamsJSON);
        //    let valuesFromJSON = '';
        //    if (response2JSON && response2JSON.data) {
        //        let idIndex = 0;
        //        let nameIndex = 0;
        //        if (response2JSON.properties) {
        //            response2JSON.properties.forEach(property => {
        //                if (property.name.toUpperCase() === 'LOOKUPCODE') {
        //                    idIndex = _.findIndex(response2JSON.data.Columns, function (o) { return o.Name === property.fromColumn; });
        //                }
        //                else if (property.name.toUpperCase() === 'LOOKUPVALUE') {
        //                    nameIndex = _.findIndex(response2JSON.data.Columns, function (o) { return o.Name === property.fromColumn; });
        //                }
        //            });
        //        }
        //        valuesFromJSON = response2JSON.data.Rows.map((row) => {
        //            let temp = {};
        //            temp.id = row.Cells[idIndex];
        //            temp.value = row.Cells[nameIndex];
        //            temp.text = row.Cells[nameIndex];
        //            return temp;
        //        });
        //    }
        //    columnElement.lookupData = valuesFromJSON;
        //}

        columnsJSON = //Promise.all(
            databaseData.data.Columns.map(function (column) {
            const temp = {};
            temp.field = column.Name;
            temp.headerName = column.Name;
            temp.netType = column.NetType;
            const property = _.find(databaseData.properties, function (o) { return o.fromColumn === column.Name; });
            if (property) {
                temp.headerName = property.displayName;
                temp.lookupChannelName = property.lookupChannelName;
                //if (property.lookupChannelName) {
                //    await fetchLookupData(temp);
                //}
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

    //React.useEffect(() => {
    //    if (modifiedTables?.includes(databaseData.tableId)) {
    //        reload();
    //    }
    //}, [modifiedTables, databaseData, reload]);

    async function deleteRows(elementsToRemove) {
        const response = await utils.webFetch(`removeRows?sessionId=${sessionId}&tableId=${databaseData.tableId}&rows=${elementsToRemove}`);
        await response.json();
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
            const response = await utils.webFetch(`insertRow?sessionId=${sessionId}&tableId=${databaseData.tableId}&rowData=${dataJSON}`);
            await response.json();
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

    return (
        <div>
            <DataSetView inputTableData={tableData} formData={formData} apply={apply} deleteRows={deleteRows} />
        </div>
    );
}
