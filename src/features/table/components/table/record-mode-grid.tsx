import { ReactElement, useMemo } from 'react';
import { Grid, GridCellProps, GridColumn } from '@progress/kendo-react-grid';
import { CellActions } from '../../lib/types';
import { RecordModeColumnCell } from '../cells/record-mode-column-cell';


interface RecordModeGridProps {
  state: TableState;
  activeRecord: TableRecord;
  cellRender: (td: ReactElement, props: GridCellProps) => ReactElement;
  actions: CellActions;
}


export const RecordModeGrid = ({state, cellRender, activeRecord, actions}: RecordModeGridProps) => {
  const { columnTreeFlatten, columns, activeCell } = state;
  const visibleColumns = columnTreeFlatten.map(c => columns[c]);

  const records = getTableRecordModeRows(visibleColumns, activeRecord);
  const data = useMemo(() => {
    records.forEach((record) => {
      record.selected = activeCell.columnID === record['field'];
    });
    return records;
  }, [records, activeCell])

  const cellRenderRecordMode = (td: ReactElement, props: GridCellProps) => {
    const newProps = {
      ...props,
      field: props.dataItem['field'],
      dataItem: {...props.dataItem, id: activeRecord?.id}
    };
    if (props.columnIndex === 0)
      return <RecordModeColumnCell td={td} props={newProps} actions={actions} state={state} />;
    return cellRender(td, newProps);
  };

  return (
    <Grid
      data={data} dataItemKey={'id'}
      resizable={true} groupable={false}
      reorderable={false} navigatable={false}
      cellRender={activeRecord ? cellRenderRecordMode : null}
      rowHeight={28} style={{height: '100%'}}
      selectable={{mode: 'single'}} selectedField={'selected'}
    >
      <GridColumn field={'Column'} title={'Колонка'} width={200}/>
      <GridColumn field={'Value'} title={'Значение'}/>
    </Grid>
  );
};

function getTableRecordModeRows(columns: TableColumnState[], activeRecord: TableRecord): TableRecord[] {
  return columns.map((c) => {
    let value = activeRecord ? activeRecord[c.field] : null;
    if (value !== null && c.type === 'date') value = new Date(value);

    return {
      field: c.field, [c.field]: value,
      Column: c.title,
      Value: c.type === 'date' && value ? value.toLocaleDateString() : value,
    };
  });
}
