import React from 'react';
import { useSelector } from 'react-redux';
import DataSetView from "./DataSet/DataSetView";

function DataSet(props, ref) {
    const sessionManager = useSelector((state) => state.sessionManager);
    const { formData, data } = props;
    const [activeChannelName] = React.useState(data.activeChannels[0]);
    const rowToAdd = React.useRef(null);

    const reload = React.useCallback(async () => {
        await sessionManager.channelsManager.loadAllChannelData(activeChannelName, formData.id, true);
    }, [activeChannelName, formData, sessionManager]);

    const databaseData = useSelector((state) => state.channelsData[activeChannelName]);

    const rowConverter = (columnsJSON, row, rowIndex) => {
        const temp = {};
        temp.js_id = rowIndex;
        if (row) {
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
                            const textvalue = column.lookupData.find((c) => ('' + c.id) === ('' + prevalue))?.text;
                            temp[column.field] = textvalue ?? prevalue;
                            temp[column.field + '_jsoriginal'] = rowValue;
                        }
                        else {
                            temp[column.field] = rowValue;
                        }
                    }
                }
            });
        }
        return temp;
    };

    var columnsJSON = [];
    var rowsJSON = [];
    if (databaseData && databaseData.data && databaseData.properties) {
        columnsJSON = databaseData.properties.map(function (property) {
            const column = databaseData.data.Columns.find(o => o.Name === (property.fromColumn ?? property.name));
            const temp = {};
            temp.treePath = property.treePath;
            temp.field = property.name;
            temp.fromColumn = property.fromColumn;
            temp.netType = column?.NetType;
            temp.headerName = property.displayName;
            temp.lookupChannelName = property.lookupChannelName;
            temp.lookupData = property.lookupData;
            return temp;
        });

        rowsJSON = databaseData.data.Rows.map((row, rowIndex) => rowConverter(columnsJSON, row, rowIndex));
    }

    var tableData = {
        rowsJSON: rowsJSON,
        columnsJSON: columnsJSON,
        databaseData: databaseData,
        properties: databaseData?.properties,
        currentRowObjectName: databaseData?.currentRowObjectName
    };

    async function deleteRows(elementsToRemove, removeAll) {
        await sessionManager.channelsManager.deleteRows(databaseData.tableId, elementsToRemove, removeAll);
    }

    async function apply(rowToInsert, editID, rowAdding) {
        var cells = [];
        databaseData.data.Columns.forEach((column, index) => {
            let prop = databaseData.properties.find(property => column.Name === (property.fromColumn ?? property.name) && (rowToInsert[property.name] !== null));
            if (!rowAdding)
            {
                prop = databaseData.properties.find(property => column.Name === (property.fromColumn ?? property.name) && (databaseData.data.Rows[editID].Cells[cells.length] !== (property.lookupData ? rowToInsert[property.name + '_jsoriginal'] : rowToInsert[property.name])));
            }
            if (!prop) {
                prop = databaseData.properties.find(property => column.Name === (property.fromColumn ?? property.name) && rowToInsert.hasOwnProperty(property.name));
            }
            if (prop) {
                if (prop.lookupData) {
                    return cells.push(rowToInsert[prop.name + '_jsoriginal'])
                }
                return cells.push(rowToInsert[prop.name])
            }
            else {
                let rowValue = (rowAdding ? rowToAdd.current : databaseData.data.Rows[rowToInsert['js_id']])?.Cells[index];
                if (column.NetType === 'System.DateTime' && rowValue) {
                    const startIndex = rowValue.indexOf('(');
                    const finishIndex = rowValue.lastIndexOf('+');
                    const dateValue = rowValue.slice(startIndex + 1, finishIndex);
                    var d = new Date();
                    d.setTime(dateValue);
                    rowValue = d;
                }
                return cells.push(rowValue)
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

    async function getRow() {
        const result = await sessionManager.channelsManager.getNewRow(databaseData.tableId);
        rowToAdd.current = result;
        return rowConverter(tableData.columnsJSON, result, tableData.rowsJSON.length);
    }

    const _viewRef = React.useRef(null);
    React.useImperativeHandle(ref, () => ({
        excelExport: () => {
            _viewRef.current.excelExport();
        },
        selectAll: () => {
            _viewRef.current.selectAll();
        },
        activeCell: () => {
            return _viewRef.current.activeCell();
        },
        properties: () => {
            return databaseData?.properties;
        },
        tableId: () => {
            return databaseData.tableId;
        }
    }));

    return (
        <div className="grid-container">
            <DataSetView
                inputTableData={tableData}
                activeChannelName={activeChannelName}
                editable={databaseData?.data?.Editable}
                dataPart={databaseData?.data?.DataPart}
                formData={formData}
                apply={apply}
                deleteRows={deleteRows}
                getRow={getRow}
                reload={reload}
                ref={_viewRef} />
        </div>
    );
}
export default DataSet = React.forwardRef(DataSet); // eslint-disable-line