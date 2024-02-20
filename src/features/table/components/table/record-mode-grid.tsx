import {ReactElement, useMemo} from 'react';
import {
  Grid,
  GridCellProps,
  GridColumn,
} from '@progress/kendo-react-grid';
import {CellActions} from '../../lib/types.ts';
import {RecordModeColumnCell} from '../cells/record-mode-column-cell.tsx';
import {stringifyLocalDate} from '../../../../shared/lib';

interface RecordModeGridProps {
  state: TableState;
  activeRecord: TableRecord;
  cellRender: (td: ReactElement, props: GridCellProps) => ReactElement;
  actions: CellActions;
}

export const RecordModeGrid = ({state, cellRender, activeRecord, actions}: RecordModeGridProps) => {
  const {columnTree, columns, activeCell} = state;

  const visibleColumns = columnTree
    .filter(cT => cT.visible)
    .map(cT => columns[cT.field]);

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
    <Grid data={data}
          resizable={true} groupable={false}
          reorderable={false} navigatable={false}
          dataItemKey={'id'}
          selectedField={'selected'}
          cellRender={cellRenderRecordMode}
          rowHeight={28}
          selectable={{mode: 'single'}}
          style={{height: '100%'}}
    >
      <GridColumn field="Column" title="Колонка" width="200px" />
      <GridColumn field="Value" title="Значение" />
    </Grid>
  );
};

function getTableRecordModeRows(columns: TableColumnState[], activeRecord: TableRecord) {
  const columnId = 'Column';
  const valueId = 'Value';
  return Object.values(columns).map(c => {
    const row: TableRecord = {};

    let value = activeRecord ? activeRecord[c.field] : null;
    if (value !== null && c.type === 'date') value = new Date(value);

    row['field'] = c.field;
    row[c.field] = value;
    row[columnId] = c.title;
    row[valueId] = c.type === 'date' && value ?
      stringifyLocalDate(value, '.', true) :
      value;

    return row;
  })
}
