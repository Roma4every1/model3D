import type { FC, ReactElement, ChangeEvent } from 'react';
import type { CheckboxProps } from 'antd';
import type { TableState, TableColumnModel } from '../../lib/types';
import type { TableColumnFilterState } from '../../lib/filter.types';
import dayjs, { Dayjs } from 'dayjs';
import { Select, Input, InputNumber, DatePicker, Checkbox, Button, Switch, Spin } from 'antd';
import { useRender } from 'shared/react';
import { ButtonSwitch } from 'shared/ui';
import { inputNumberParser } from 'shared/locales';
import { getDefaultFilterState, buildFilterNode } from '../../lib/filter-utils';
import { updateTableState } from '../../store/table.actions';
import { updateTableFilters, applyFilterUniqueValues } from '../../store/table-filters.thunks';

import {
  filterOperators, numberFilterOptions,
  colorFilterOptions, stringFilterOptions, dateFilterOptions,
} from '../../lib/constants';


interface ColumnFilterProps {
  state: TableState;
  column: TableColumnModel;
  close: () => void;
}
interface FilterContentProps<T extends TableColumnType = any> {
  id: FormID;
  column: TableColumnModel;
  state: TableColumnFilterState<T>;
}


const filterContentComponents: Record<TableColumnType, FC<FilterContentProps>> = {
  'bool': BooleanFilterContent,
  'int': NumberFilterContent,
  'real': NumberFilterContent,
  'text': StringFilterContent,
  'date': DateFilterContent,
  'list': LookupFilterContent,
  'tree': LookupFilterContent,
  'color': StringFilterContent,
};

export const ColumnFilter = (props: ColumnFilterProps) => {
  const { type, filter } = props.column;
  const Content = filterContentComponents[type];

  return (
    <div className={'column-filter-container'}>
      <Content id={props.state.id} column={props.column} state={filter.state}/>
      <ColumnFilterFooter {...props}/>
    </div>
  );
};

const ColumnFilterFooter = ({state, column, close}: ColumnFilterProps) => {
  const filter = column.filter;
  const enabled = filter.enabled;

  const apply = () => {
    filter.node = buildFilterNode(column);
    filter.enabled = true;
    updateTableFilters(state.id, column.id).then();
    close();
  };
  const reset = () => {
    if (filter.node) {
      filter.state = getDefaultFilterState(column.type);
      filter.node = null;
      updateTableFilters(state.id, column.id).then();
    } else {
      updateTableState(state.id);
    }
    close();
  };
  const toggle = () => {
    filter.enabled = !filter.enabled;
    updateTableFilters(state.id, column.id).then();
  };

  return (
    <div className={'column-filter-footer'}>
      <Button onClick={apply}>Применить</Button>
      <Button onClick={reset}>Очистить</Button>
      <Switch checked={enabled} onChange={toggle} title={'Применяется ли фильтр'}/>
    </div>
  );
}

function BooleanFilterContent({state}: FilterContentProps<'bool'>) {
  const render = useRender();
  const value = state.value;

  const setTrue: CheckboxProps['onChange'] = (e) => {
    state.value = e.target.checked ? true : undefined;
    render();
  };
  const setFalse: CheckboxProps['onChange'] = (e) => {
    state.value = e.target.checked ? false : undefined;
    render();
  };

  return (
    <div className={'boolean-filter-content'}>
      <Checkbox checked={value === true} onChange={setTrue}>Истинно</Checkbox>
      <Checkbox checked={value === false} onChange={setFalse}>Ложно</Checkbox>
    </div>
  );
}

function NumberFilterContent({state}: FilterContentProps<'int'>) {
  const render = useRender();
  const { type1, value1, type2, value2, operator } = state;

  const setType1 = (type: FilterLeafType) => { state.type1 = type; render(); };
  const setValue1 = (value: number) => { state.value1 = value ?? undefined; render(); };
  const setType2 = (type: FilterLeafType) => { state.type2 = type; render(); };
  const setValue2 = (value: number) => { state.value2 = value ?? undefined; render(); };
  const setOperator = (value: 'and' | 'or') => { state.operator = value; render(); };

  return (
    <div className={'number-filter-content'}>
      <fieldset>
        <Select options={numberFilterOptions} value={type1} onChange={setType1}/>
        <InputNumber
          value={value1} onChange={setValue1}
          parser={inputNumberParser} changeOnWheel={true}
        />
      </fieldset>
      <ButtonSwitch options={filterOperators} value={operator} onChange={setOperator}/>
      <fieldset>
        <Select options={numberFilterOptions} value={type2} onChange={setType2}/>
        <InputNumber
          value={value2} onChange={setValue2}
          parser={inputNumberParser} changeOnWheel={true}
        />
      </fieldset>
    </div>
  );
}

function StringFilterContent({column, state}: FilterContentProps<'text'>) {
  const render = useRender();
  const { type1, value1, type2, value2, operator } = state;
  const options = column.type === 'text' ? stringFilterOptions : colorFilterOptions;

  const setType1 = (type: FilterLeafType) => {
    state.type1 = type;
    render();
  };
  const setValue1 = (e: ChangeEvent<HTMLInputElement>) => {
    state.value1 = e.target.value;
    render();
  };
  const setType2 = (type: FilterLeafType) => {
    state.type2 = type;
    render();
  };
  const setValue2 = (e: ChangeEvent<HTMLInputElement>) => {
    state.value2 = e.target.value;
    render();
  };
  const setOperator = (value: 'and' | 'or') => {
    state.operator = value;
    render();
  };

  return (
    <div className={'string-filter-content'}>
      <fieldset>
        <Select options={options} value={type1} onChange={setType1}/>
        <Input value={value1} onChange={setValue1}/>
      </fieldset>
      <ButtonSwitch options={filterOperators} value={operator} onChange={setOperator}/>
      <fieldset>
        <Select options={options} value={type2} onChange={setType2}/>
        <Input value={value2} onChange={setValue2}/>
      </fieldset>
    </div>
  );
}

function DateFilterContent({state}: FilterContentProps<'date'>) {
  const render = useRender();
  const { type1, value1, type2, value2, operator } = state;

  const setType1 = (type: FilterLeafType) => { state.type1 = type; render(); };
  const setValue1 = (date: Dayjs) => { state.value1 = date?.toDate(); render(); };
  const setType2 = (type: FilterLeafType) => { state.type2 = type; render(); };
  const setValue2 = (date: Dayjs) => { state.value2 = date?.toDate(); render(); };
  const setOperator = (value: 'and' | 'or') => { state.operator = value; render(); };

  const date1 = value1 ? dayjs(value1) : undefined;
  const date2 = value2 ? dayjs(value2) : undefined;

  return (
    <div className={'date-filter-content'}>
      <fieldset>
        <Select options={dateFilterOptions} value={type1} onChange={setType1}/>
        <DatePicker value={date1} onChange={setValue1} format={'DD.MM.YYYY'}/>
      </fieldset>
      <ButtonSwitch options={filterOperators} value={operator} onChange={setOperator}/>
      <fieldset>
        <Select options={dateFilterOptions} value={type2} onChange={setType2}/>
        <DatePicker value={date2} onChange={setValue2} format={'DD.MM.YYYY'}/>
      </fieldset>
    </div>
  );
}

function LookupFilterContent({id, column, state}: FilterContentProps<'list'>) {
  const render = useRender();
  const filterValues = state.values;
  const filterOptions = column.filter.uniqueValues;
  const noOptions = !Array.isArray(filterOptions);

  if (noOptions) {
    setTimeout(() => { // prevent duplicate fetch
      if (column.filter.uniqueValues) return;
      column.filter.uniqueValues = 'loading';
      applyFilterUniqueValues(id, column.id).then(render);
    }, 100);
  }
  const toElement = (value: LookupItemID): ReactElement => {
    const title = column.lookupDict[value];
    const checked = filterValues.has(value);

    const onChange = () => {
      checked ? filterValues.delete(value) : filterValues.add(value);
      render();
    };
    return <Checkbox key={value} checked={checked} onChange={onChange}>{title}</Checkbox>;
  };

  return (
    <Spin spinning={noOptions} delay={100}>
      <div className={'lookup-filter-content'}>
        {!noOptions && filterOptions.map(toElement)}
      </div>
    </Spin>
  );
}
