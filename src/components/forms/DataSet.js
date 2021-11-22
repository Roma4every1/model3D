import React from 'react';
import { useSelector } from 'react-redux';
import DataSetView from "./DataSet/DataSetView";
var _ = require("lodash");

function DataSet(props, ref) {
    const sessionManager = useSelector((state) => state.sessionManager);
    const sessionId = useSelector((state) => state.sessionId);
    const { formData, channels } = props;
    const [activeChannelName] = React.useState(channels[0]);
    const [tableSettings, setTableSettings] = React.useState(null);

    const reload = React.useCallback(async () => {
        await sessionManager.channelsManager.loadAllChannelData(activeChannelName, formData.id, true);
    }, [activeChannelName, formData, sessionManager]);

    React.useEffect(() => {
        let ignore = false;
        if (sessionId) {
            async function fetchData() {
                const data = await sessionManager.fetchData(`getDataSetFormParameters?sessionId=${sessionId}&formId=${formData.id}`);
                if (!ignore) {
                    setTableSettings(data);
                }
            }
            fetchData();
        }
        return () => { ignore = true; }
    }, [sessionId, formData]);

    const databaseData = useSelector((state) => state.channelsData[activeChannelName]);

    var columnsJSON = [];
    var rowsJSON = [];
    if (databaseData && databaseData.data && databaseData.properties) {
        columnsJSON = databaseData.properties.map(function (property) {
            const column = databaseData.data.Columns.find(o => o.Name === (property.fromColumn ?? property.name));
            const temp = {};
            temp.field = property.name;
            temp.fromColumn = property.fromColumn;
            temp.netType = column.NetType;
            temp.headerName = property.displayName;
            temp.lookupChannelName = property.lookupChannelName;
            temp.lookupData = property.lookupData;
            return temp;
        });

        rowsJSON = databaseData.data.Rows.map(function (row, rowIndex) {
            const temp = {};
            temp.js_id = rowIndex;
            columnsJSON.forEach(column => {
                let i = databaseData.data.Columns.findIndex(o => o.Name === (column.fromColumn ?? column.field));
                if (i >= 0) {
                    let rowValue = row.Cells[i];
                    if (column.netType === 'System.DateTime' && rowValue) {
                        const startIndex = rowValue.indexOf('(');
                        const finishIndex = rowValue.lastIndexOf('+');
                        const dateValue = rowValue.slice(startIndex + 1, finishIndex);
                        var d = new Date();
                        d.setTime(dateValue);
                        temp[column.field] = d;
                    }
                    else {
                        if (column.lookupData) {
                            const prevalue = rowValue;
                            const textvalue = column.lookupData.find((c) => c.id === prevalue)?.text;
                            temp[column.field] = textvalue;
                            temp[column.field + '_jsoriginal'] = rowValue;
                        }
                        else {
                            temp[column.field] = rowValue;
                        }
                    }
                }
            });
            return temp;
        });
    }

    var tableData = {
        rowsJSON: rowsJSON,
        columnsJSON: columnsJSON,
        properties: databaseData?.properties
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

    const _viewRef = React.useRef(null);
    React.useImperativeHandle(ref, () => ({
        excelExport: () => {
            _viewRef.current.excelExport();
        },
        selectAll: () => {
            _viewRef.current.selectAll();
        }
    }));

    return (
        <div className="grid-container">
            <DataSetView inputTableData={tableData} tableSettings={tableSettings} formData={formData} apply={apply} deleteRows={deleteRows} reload={reload} ref={_viewRef} />
        </div>
    );
}
export default DataSet = React.forwardRef(DataSet); // eslint-disable-line