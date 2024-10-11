import type { ChangeEvent } from 'react';
import type { TFunction } from 'react-i18next';
import type { TableState, TableColumnModel } from '../../lib/types';
import { useRef, useMemo } from 'react';
import { Button, Popover } from 'antd';
import { BigButtonToggle, MenuSection } from 'shared/ui';
import { UploadOutlined, DownloadOutlined, ClearOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { filterToString, getDefaultFilterState } from '../../lib/filter-utils';
import { updateTableFilters, saveTableFilters, applyUploadedFilters } from '../../store/table-filters.thunks';
import filterStateIcon from 'assets/table/filter-state.svg';


interface TableFilterSectionProps {
  state: TableState;
  t: TFunction;
}
interface FilterViewProps {
  filtered: TableColumnModel[];
}
interface ColumnFilterViewProps {
  column: TableColumnModel;
}


export const TableFilterSection = ({state, t}: TableFilterSectionProps) => {
  const columns = state.columns.list;
  const globalSettings = state.globalSettings;

  const filteredColumns = globalSettings.filterEnabled
    ? columns.filter(c => c.filter?.node && c.filter.enabled)
    : [];

  const inputRef = useRef<HTMLInputElement>();
  const openFiles = () => inputRef.current.click();
  const saveFilters = () => saveTableFilters(state.id);

  const recordMode = !globalSettings.tableMode;
  const noFilters = filteredColumns.length === 0;
  const infoIconStyle = noFilters ? undefined : {fill: 'var(--wm-primary-60)'}
  const PopoverContent = () => <FilterView filtered={filteredColumns}/>;

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    if (file) applyUploadedFilters(state.id, file).then();
    e.target.value = null;
  };
  const toggleFilterEnabled = () => {
    globalSettings.filterEnabled = !globalSettings.filterEnabled;
    updateTableFilters(state.id).then();
  };
  const clearFilters = () => {
    for (const column of columns) {
      if (!column.filter) continue;
      column.filter.state = getDefaultFilterState(column.type);
      column.filter.node = null;
    }
    updateTableFilters(state.id).then();
  };

  return (
    <MenuSection className={'big-buttons'} header={t('table.panel.section-filter')}>
      <BigButtonToggle
        text={t('table.panel.filter-enabled')} icon={filterStateIcon} style={{width: 70}}
        active={globalSettings.filterEnabled} onClick={toggleFilterEnabled} disabled={recordMode}
      />
      <div className={'table-filter-actions'}>
        <Button
          icon={<UploadOutlined/>} title={t('table.panel.filter-upload')}
          onClick={openFiles} disabled={recordMode}
        />
        <Button
          icon={<DownloadOutlined/>} title={t('table.panel.filter-download')}
          onClick={saveFilters} disabled={recordMode || noFilters}
        />
        <Popover content={PopoverContent} trigger={'click'} placement={'bottom'}>
          <Button
            icon={<InfoCircleOutlined style={infoIconStyle}/>}
            title={t('table.panel.filter-info')} disabled={recordMode}
          />
        </Popover>
        <Button
          icon={<ClearOutlined/>} title={t('table.panel.filter-clear')}
          onClick={clearFilters} disabled={recordMode}
        />
        <input ref={inputRef} type={'file'} accept={'.json'} onChange={handleFile}/>
      </div>
    </MenuSection>
  );
};

const FilterView = ({filtered}: FilterViewProps) => {
  if (filtered.length === 0) {
    return <div>Фильтры не применяются</div>;
  }
  const toElement = (column: TableColumnModel) => {
    return <ColumnFilterView key={column.id} column={column}/>;
  };
  return <ul className={'table-filter-view'}>{filtered.map(toElement)}</ul>;
};

const ColumnFilterView = ({column}: ColumnFilterViewProps) => {
  const filterNode = column.filter.node;
  const { type, lookupDict, displayName } = column;

  const tokens = useMemo(() => {
    return filterToString(filterNode, type, lookupDict);
  }, [filterNode, type, lookupDict]);

  const tokenToElement = (token: any, i: number) => {
    if (typeof token === 'string') return <span key={i}>{token}</span>;
    return <span key={i} className={token.type}>{token.value}</span>;
  };
  return <li>{displayName}: {tokens.map(tokenToElement)}</li>;
};
