import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import { Grid, GridColumn, GridColumnMenuFilter } from '@progress/kendo-react-grid';
import { getSelectedState, getSelectedStateFromKeyDown } from '@progress/kendo-react-grid';

import { ColumnMenu } from './column-menu';
import { SecondLevelTable } from './second-level-table';
import { DataSetEditToolbar } from './dataset-edit-toolbar';
import { DeleteRowsDialog } from './delete-rows-dialog';
import { CellRender } from './renderers';

import { getFilterByType, getColumnWidth, apply } from '../lib/dataset-utils';
import { getParentFormId, tableRowToString, compareObjects } from '../../../shared/lib';
import { filterOperators, /*filterOperations*/ } from '../lib/constants';
import { sessionManager, paramsManager } from '../../../app/store';
import { formSettingsSelector, setFormSettings } from '../../../widgets/form';
import { addParam, updateParam } from '../../../entities/parameters';
import { deleteRows } from '../../../entities/channels';
import { setOpenedWindow } from '../../../entities/windows';
import { programsAPI } from '../../../entities/reports/lib/programs.api';
import { watchReport } from '../../../entities/reports';

const DATA_ITEM_KEY = 'js_id';
const SELECTED_FIELD = 'js_selected';
const EDIT_FIELD = 'js_inEdit';


const getGridColumns = (tableData, drawColumn, tableColumnGroupSettings) => {
  const columns = [];

  for (const col of tableData.columnsJSON) {
    const treePath = col.treePath;
    const column = drawColumn(col, tableData.rowsJSON);
    if (!treePath || treePath.length === 0) { columns.push(column); continue; }

    let parent = null;
    for (const part of treePath) {
      let trimPart = part.trim();
      let parentArray = parent?.props?.children ?? columns;
      let columnSetting = tableColumnGroupSettings?.find(s => s.columnGroupName === trimPart);
      parent = parentArray.find(p => p?.key === trimPart);

      if (!parent) {
        const title = columnSetting?.calculatedDisplayName
          ?? (columnSetting?.columnGroupDisplayName ?? trimPart);

        parent = <GridColumn key={trimPart} title={title} children={[]}/>;
        parentArray.push(parent);
      }
    }
    parent.props.children.push(column)
  }
  return columns;
};

const getEditor = (column, properties, formID, dispatch) => {
  if (!column) return {type: ''};
  const result = {};

  if (properties) {
    const property = properties.find(p => p.name === column.field);
    if (property && property.secondLevelChannelName) {
      result.setOpened = (arg) => dispatch(setOpenedWindow(property.name, arg,
        <SecondLevelTable
          key={formID + property.name}
          formID={formID + property.name}
          parentFormID={formID}
          channelName={property.secondLevelChannelName}
          onClose={() => dispatch(setOpenedWindow(property.name, false, null))}
        />));
    }
  }

  if (column.lookupData) {
    result.type = 'lookup';
    result.values = column.lookupData;
  } else {
    switch (column.netType) {
      case 'System.Decimal':
      case 'System.Double':
      case 'System.Int32':
      case 'System.Int64':
        result.type = 'numeric';
        break;
      case 'System.DateTime':
        result.type = 'date';
        break;
      default: result.type = 'string';
    }
  }
  return result;
};

function DataSetView_(props, ref) {
  const dispatch = useDispatch();
  const { getRow, reload, channelName, inputTableData, formData } = props;

  const formID = formData.id;
  const editable = inputTableData.databaseData?.data?.editable;
  const dataPart = inputTableData.databaseData?.data?.dataPart;

  /** @type DataSetFormSettings */
  const tableSettings = useSelector(formSettingsSelector.bind(formID));
  const tableColumnGroupSettings = useSelector((state) => {
    return state.dataSets[formID]?.columns?.ColumnGroupSettings
  });

  const [rowAdding, setRowAdding] = useState(false);
  const [edited, setEdited] = useState(false);
  const [activeCell, setActiveCell] = useState(null);
  const [tableData, setTableData] = useState({rowsJSON: [], columnsJSON: []});
  const [dataState, setDataState] = useState({skip: 0, take: 50});
  const [editField, setEditField] = useState(undefined);
  const [editID, setEditID] = useState(null);
  const [selectedState, setSelectedState] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // useEffect(() => {
  //   if (!inputTableData.properties) return;
  //   let neededParamArray = { channelName, params: [] };
  //   inputTableData.properties.forEach(prop => {
  //     const id = prop.name + 'ConditionFilterObject';
  //     neededParamArray.params.push({id, type: 'condition', value: null});
  //   });
  //   dispatch(addParamSet(neededParamArray));
  // }, [channelName, inputTableData.properties, dispatch]);

  useEffect(() => {
    const maxRowCountElement = {id: 'maxRowCount', type: 'integer', value: null};
    //const sortOrder = {id: 'sortOrder', type: 'sortOrder', value: null}
    dispatch(addParam(channelName, maxRowCountElement));
    //dispatch(addParam(channelName, sortOrder));
  }, [channelName, dispatch]);

  // useEffect(() => {
  //   if (!dataState) return;
  //   let neededParamArray = [];
  //
  //   if (!dataState.sort) {
  //     neededParamArray.push({name: "sortOrder", value: null});
  //   } else {
  //     const newValue = dataState.sort.map((el) => {
  //       let field = el.field;
  //       if (inputTableData.properties) {
  //         const property = inputTableData.properties.find(o => o.name === el.field);
  //         field = property.fromColumn ?? property.name;
  //       }
  //       return `${field} ${el.dir}`;
  //     }).join(',');
  //     neededParamArray.push({name: "sortOrder", value: newValue});
  //   }
  //
  //   if (dataState.filter) {
  //     dataState.filter.filters.forEach(flt => {
  //       let filterValue = `<${flt.logic}>`;
  //       let fieldName = flt.filters[0].field;
  //       let col = inputTableData.columnsJSON.find(c => c.field === fieldName);
  //       flt.filters.forEach(filter => {
  //         const operation = filterOperations[filter.operator] || 'equal';
  //         let center = '';
  //         let fieldFilter = filter.value;
  //         if (col.lookupData) {
  //           fieldFilter = col.lookupData.find(ld => ld.value === fieldFilter).id;
  //         } else switch (col.netType) {
  //           case "System.DateTime":
  //             if (typeof fieldFilter === 'string') {
  //               fieldFilter = new Date(fieldFilter);
  //               filter.value = fieldFilter;
  //             }
  //             break;
  //           case "System.Decimal":
  //           case "System.Double":
  //           case "System.Int32":
  //           case "System.Int64":
  //             if (typeof fieldFilter === 'string') {
  //               fieldFilter = Number(fieldFilter.replace(',', '.'));
  //             }
  //             break;
  //           default: {}
  //         }
  //         if (!operation.includes('Null')) {
  //           center = `<netType typeName="${col.netType}" value="${fieldFilter}"/>`
  //         }
  //         filterValue += `<${operation}>${center}</${operation}>`;
  //       });
  //       filterValue += `</${flt.logic}>`;
  //       neededParamArray.push({ name: fieldName + "ConditionFilterObject", value: filterValue });
  //     });
  //   }
  //   inputTableData.columnsJSON.forEach((c) => {
  //     let needClear = (!dataState.filter) || !dataState.filter.filters
  //       .some(flt => flt.filters[0].field === c.field);
  //     if (needClear) {
  //       neededParamArray.push({ name: c.field + "ConditionFilterObject", value: null });
  //     }
  //   });
  //   dispatch(updateParamSet(channelName, neededParamArray));
  // }, [dataState, channelName, inputTableData, dispatch]);

  const onDataStateChange = (event) => {
    setDataState(event.dataState);
    if (dataPart && (dataToShow.length < event.dataState.skip + event.dataState.take * 2)) {
      const value = dataToShow.length + 500;
      dispatch(updateParam(channelName, 'maxRowCount', value));
    }
  };

  const handleDeleteDialogOpen = () => { setDeleteDialogOpen(true); };
  const handleDeleteDialogClose = () => { setDeleteDialogOpen(false); };

  const addRecord = async (existingRecord) => {
    const rowsJSON = tableData.rowsJSON;
    let copy = true;
    let index = Math.min(...Object.keys(selectedState).map(n => parseInt(n)));
    if (index === Infinity) { copy = false; index = 0; }

    const newRecord = existingRecord && copy
      ? {...rowsJSON[index], [DATA_ITEM_KEY]: rowsJSON.length + 1}
      : await getRow();

    rowsJSON.splice(index, 0, newRecord);
    setTableData({...tableData});
    setEditID(newRecord[DATA_ITEM_KEY]);
    setRowAdding(true);
  };

  const excelExport = async () => {
    const dataD = sessionManager.channelsManager.getAllChannelParams(channelName);
    const paramValues = paramsManager.getParameterValues(dataD, formID, false, channelName);

    let settings = tableSettings?.columns;
    if (settings) {
      const mapper = (c) => {
        const isVisible = tableData.columnsJSON.some(cc => cc.field === c.channelPropertyName);
        return {...c, isVisible}
      };
      const columnsSettings = settings.columnsSettings.map(mapper);
      settings = {...settings, columnsSettings};
    }

    const exportData = {
      channelName, paramValues, settings,
      paramName: formData.displayName,
      presentationId: getParentFormId(formID),
    };
    const { ok, data } = await programsAPI.exportToExcel(exportData);
    if (ok) watchReport(data.OperationId, dispatch);
  };

  const onItemChange = (event) => {
    setEdited(true);
    const editedItemID = event.dataItem[DATA_ITEM_KEY];
    const field = event.field + '_jsoriginal';
    const data = tableData.rowsJSON.map(item =>
        item[DATA_ITEM_KEY] === editedItemID ? (event.dataItem[field]
          ? { ...item, [event.field]: event.value, [field]: event.dataItem[field] }
          : { ...item, [event.field]: event.value }) : item
    );
    setTableData({ rowsJSON: data, columnsJSON: tableData.columnsJSON });
  };

  const onSelectionChange = (event) => {
    const options = {event, selectedState, dataItemKey: DATA_ITEM_KEY};
    const newSelectedState = getSelectedState(options);
    if (compareObjects(newSelectedState, selectedState)) return;

    setSelectedState(newSelectedState);
    if (edited) applyEdit();
    setEditID(null);

    // обновление currentRowObjectName, если выделена только 1 запись
    if (!inputTableData.currentRowObjectName) return;
    const selectedRowIndexes = Object.keys(newSelectedState);
    if (selectedRowIndexes.length !== 1) return;

    const { databaseData, currentRowObjectName } = inputTableData;
    const row = databaseData.data.rows[selectedRowIndexes[0]];

    const parentFormID = getParentFormId(formID);
    const value = tableRowToString(databaseData, row)?.value;
    dispatch(updateParam(parentFormID, currentRowObjectName, value));
  };

  const exitEdit = () => {
    const newData = tableData.rowsJSON.map((item) => ({ ...item, [EDIT_FIELD]: false }));
    setTableData({ rowsJSON: newData, columnsJSON: tableData.columnsJSON });
    setEditField(undefined);
  };

  const onKeyDown = (event) => {
    const newSelectedState = getSelectedStateFromKeyDown({
      event, selectedState, dataItemKey: DATA_ITEM_KEY,
    });
    if (!compareObjects(newSelectedState, selectedState)) {
      setSelectedState(newSelectedState);
      if (edited) applyEdit();
      setEditID(null);
    }

    switch (event.nativeEvent.key) {
      case 'Insert': {
        if (editable && !rowAdding) addRecord(event.nativeEvent.ctrlKey);
        break;
      }
      case 'Escape': {
        exitEdit();
        break;
      }
      case 'Delete': {
        if (!event?.syntheticEvent?.target?.form?.className?.includes('filter')) {
          if (editable && !(editID != null && editField) && Object.keys(selectedState).length > 0) {
            handleDeleteDialogOpen();
          }
        }
        break;
      }
      case 'Enter': {
        if (edited) applyEdit();
        break;
      }
      case 'End': {
        if (event.nativeEvent.ctrlKey && tableData.rowsJSON.length > 0) {
          let rowIndex = tableData.rowsJSON.length - 1;
          setDataState({...dataState, skip: rowIndex - 20 > 0 ? rowIndex - 20 : 0 });
          setSelectedState({[rowIndex]: true});
          applyEdit();
          setEditID(null);
        }
        break;
      }
      case 'PageUp': {
        if (tableData.rowsJSON.length > 0) {
          setSelectedState({ 0: true });
          applyEdit();
          setEditID(null);
        }
        break;
      }
      case 'PageDown': {
        if (tableData.rowsJSON.length > 0) {
          let rowIndex = tableData.rowsJSON.length - 1;
          setSelectedState({[rowIndex]: true});
          applyEdit();
          setEditID(null);
        }
        break;
      }
      case 'Ф':
      case 'ф':
      case 'A':
      case 'a': {
        if (event.nativeEvent.ctrlKey) {
          selectAll();
          event.nativeEvent.preventDefault();
        }
        break;
      }
      case 'ArrowDown': {
        if (editable && !rowAdding && !(editID && editField)) {
          const index = Math.min(...Object.keys(selectedState).map(n => parseInt(n)));
          if (index === tableData.rowsJSON.length - 1) {
            addRecord(event.nativeEvent.ctrlKey);
          }
        }
        break;
      }
      default: {}
    }
  };

  // сбросить выделение, если данные перезагрузились
  useEffect(() => {
    setSelectedState({});
  }, [inputTableData]);

  useEffect(() => {
    let columnNames = [];
    if (!tableSettings || !tableSettings.attachedProperties) {
      setTableData(inputTableData);
    } else {
      if (tableSettings?.attachedProperties?.attachOption !== 'AttachNothing') {
        columnNames = inputTableData.columnsJSON.map(c => c.field)
          .filter(f => !tableSettings?.attachedProperties?.exclude.includes(f));
      }
      else {
        if (tableSettings?.attachedProperties?.exclude) {
          columnNames = tableSettings?.attachedProperties?.exclude
        }
      }
      if (tableSettings.columns.columnsSettings) {
        tableSettings.columns.columnsSettings.sort((a, b) => a.displayIndex - b.displayIndex);
        columnNames = tableSettings.columns.columnsSettings.map(s => s.channelPropertyName)
          .filter(n => columnNames.includes(n));
      }
      const columns = columnNames.map(c => inputTableData.columnsJSON.find(jsc => jsc.field === c));
      const count = tableSettings.columns.frozenColumnCount ?? 0;
      for (let i = 0; i < columns.length; i++) {
        columns[i].locked = i < count;
      }
      setTableData({ rowsJSON: inputTableData.rowsJSON, columnsJSON: columns });
    }
  }, [inputTableData, tableSettings]);

  const deleteSelectedRows = () => {
    let indexes = Object.keys(selectedState).map(n => parseInt(n));
    if (indexes.length === 0) return;

    const rowsJSON = tableData.rowsJSON;
    const tableID = inputTableData.databaseData.tableID;
    const isAll = indexes.length === rowsJSON.length;
    if (isAll) indexes = [];

    dispatch(deleteRows(tableID, indexes, isAll)).then((ok) => {
      if (!ok) return;
      if (isAll) {
        setTableData({rowsJSON: [], columnsJSON: tableData.columnsJSON});
      } else {
        indexes.forEach((idx) => {
          const indexToDelete = rowsJSON.findIndex(item => item[DATA_ITEM_KEY] === idx);
          if (indexToDelete !== -1) rowsJSON.splice(indexToDelete, 1);
        });
        setTableData({rowsJSON, columnsJSON: tableData.columnsJSON});
      }
    });
  };

  var dataToShow = tableData.rowsJSON;
  dataToShow = dataToShow.map((item) => ({
    ...item,
    [SELECTED_FIELD]: selectedState[item[DATA_ITEM_KEY]],
    [EDIT_FIELD]: item[DATA_ITEM_KEY] === editID
  }));

  const applyEdit = useCallback(() => {
    if (!edited && !rowAdding) return;
    const rowToInsert = tableData.rowsJSON.find(item => item[DATA_ITEM_KEY] === editID);
    if (!rowToInsert) return;

    apply(editID, rowToInsert, rowAdding, inputTableData.databaseData, dispatch).then(() => {
      setEditID(null);
      setEdited(false);
      setRowAdding(false);
    });
  }, [tableData, edited, editID, rowAdding, inputTableData.databaseData, dispatch]);

  const selectAll = () => {
    const newSelectedState = {};
    tableData.rowsJSON.forEach((item) => { newSelectedState[item[DATA_ITEM_KEY]] = true; });
    setSelectedState(newSelectedState);
  };

  React.useImperativeHandle(ref, () => ({
    excelExport: excelExport,
    selectAll: selectAll,
    activeCell: () => { return activeCell; }
  }));

  const enterEdit = (dataItem, field) => {
    const newData = tableData.rowsJSON.map((item) => ({
      ...item,
      [EDIT_FIELD]: item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
    }));
    setTableData({ rowsJSON: newData, columnsJSON: tableData.columnsJSON });
    setEditField(field);
    setEditID(dataItem[DATA_ITEM_KEY]);
  };

  const onColumnResize = (event) => {
    if (!tableSettings || !tableSettings.columns) return;
    const columnsSettings = tableSettings.columns.columnsSettings;
    const setWidth = (c) => {
      const columnSetting = columnsSettings.find(s => s.channelPropertyName === c.field);
      if (columnSetting) columnSetting.width = c.width;
      if (c.children) c.children.forEach(cc => { setWidth(cc); });
    };
    event.columns.forEach((c) => { setWidth(c); });
    dispatch(setFormSettings(formID, {...tableSettings}));
  };

  const customCellRender = (td, props) => {
    const column = tableData.columnsJSON.find(col => col.field === props.field);
    const editor = getEditor(column, inputTableData.properties, formID, dispatch);

    return (
      <CellRender
        editable={editable}
        originalProps={props}
        td={td}
        editor={editor}
        enterEdit={enterEdit}
        setActiveCell={setActiveCell}
        editField={editField}
      />
    );
  };

  const drawColumn = useCallback((column, rows) => {
    const { field, netType } = column;
    const findByID = (s) => s.channelPropertyName === field;
    const columnSetting = tableSettings?.columns?.columnsSettings.find(findByID);

    const settingsHeader = columnSetting?.calculatedDisplayName ?? columnSetting?.displayName;
    const header = settingsHeader ?? column.headerName;

    const width = columnSetting?.width && columnSetting.width !== 1
      ? columnSetting.width
      : getColumnWidth(header, field, rows);

    const ColumnMenuComponent = (props) => {
      return (
        <ColumnMenu
          {...props}
          tableColumn={column} formId={formID} activeChannelName={channelName}
        />
      );
    };

    const isActive = GridColumnMenuFilter.active(field, dataState.filter);
    const format = netType && netType.endsWith('DateTime') ? '{0:d}' : null;
    const filter = getFilterByType(netType);

    return (
      <GridColumn
        key={field} field={field} title={header} width={width} locked={column.locked}
        headerClassName={isActive ? 'active' : undefined}
        format={format} filter={filter}
        columnMenu={ColumnMenuComponent}
      />
    );
  }, [tableSettings, dataState, channelName, formID]);

  const gridColumns = useMemo(() => {
    return getGridColumns(tableData, drawColumn, tableColumnGroupSettings);
  }, [tableData, tableColumnGroupSettings, drawColumn])

  if (gridColumns.length === 0) return <div>Нет колонок</div>;

  return (
    <LocalizationProvider language={'ru-RU'}>
      <IntlProvider locale={'ru'}>
        {deleteDialogOpen && <DeleteRowsDialog
          count={Object.keys(selectedState).length}
          onClose={handleDeleteDialogClose}
          onApply={() => { handleDeleteDialogClose(); deleteSelectedRows(); }}/>}
        {editable && <DataSetEditToolbar
          edited={edited} adding={Boolean(rowAdding)}
          add={() => addRecord()} drop={handleDeleteDialogOpen} apply={applyEdit}
          cancel={() => { reload(); setEditID(null); setRowAdding(false); }}
        />}
        <Grid
          className={'grid-content'}
          data={dataToShow?.slice(dataState.skip, dataState.skip + dataState.take)}
          {...dataState}
          total={dataToShow.length}
          dataItemKey={DATA_ITEM_KEY}
          editField={editable ? EDIT_FIELD : null} selectedField={SELECTED_FIELD}
          rowHeight={22} pageSize={30}
          selectable={{drag: true}}
          resizable={true} sortable={true} navigatable={true}
          fixedScroll={true} scrollable={'virtual'}
          filterOperators={filterOperators}
          onColumnResize={onColumnResize}
          onDataStateChange={onDataStateChange}
          cellRender={customCellRender}
          onItemChange={onItemChange}
          onSelectionChange={onSelectionChange}
          onKeyDown={onKeyDown}
        >
          {gridColumns}
        </Grid>
      </IntlProvider>
    </LocalizationProvider>
  );
}
export const DataSetView = React.forwardRef(DataSetView_);
