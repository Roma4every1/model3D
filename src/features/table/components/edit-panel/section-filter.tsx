import type { ChangeEvent } from 'react';
import type { TFunction } from 'react-i18next';
import type { TableState, TableColumnModel } from '../../lib/types';
import { useRef, useMemo } from 'react';
import { Button, Popover } from 'antd';
import { BigButton, MenuSection } from 'shared/ui';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { downloadFilters, filterToString } from '../../lib/filter-utils';
import { applyUploadedFilters } from '../../store/table.thunks';
import filterStateIcon from 'assets/table/filter-state.svg';


interface TableFilterSectionProps {
  state: TableState;
  t: TFunction;
}
interface ColumnFilterViewProps {
  column: TableColumnModel;
}


export const TableFilterSection = ({state, t}: TableFilterSectionProps) => {
  const inputRef = useRef<HTMLInputElement>();
  const openFiles = () => inputRef.current.click();
  const download = () => downloadFilters(state.columns.list);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    if (file) applyUploadedFilters(state.id, file).then();
  };

  const disabled = !state.globalSettings.tableMode;
  const PopoverContent = () => <FilterView state={state} t={t}/>;

  return (
    <MenuSection className={'big-buttons'} header={t('table.panel.section-filter')}>
      <Popover content={PopoverContent} trigger={'click'} placement={'bottom'}>
        <BigButton
          text={t('table.panel.filter-state')} icon={filterStateIcon}
          title={t('table.panel.filter-state-hint')} disabled={disabled}
        />
      </Popover>
      <div className={'table-filter-actions'}>
        <Button
          icon={<UploadOutlined/>} title={t('table.panel.filter-upload')}
          onClick={openFiles} disabled={disabled}
        />
        <Button
          icon={<DownloadOutlined/>} title={t('table.panel.filter-download')}
          onClick={download} disabled={disabled}
        />
        <input ref={inputRef} type={'file'} accept={'.json'} onChange={handleFile}/>
      </div>
    </MenuSection>
  );
};

const FilterView = ({state}: TableFilterSectionProps) => {
  const filteredColumns = state.columns.list.filter(c => c.filter.node && c.filter.enabled);
  if (filteredColumns.length === 0) return <div>Фильтры не применяются</div>;

  const toElement = (column: TableColumnModel) => {
    return <ColumnFilterView key={column.id} column={column}/>;
  };
  return (
    <ul className={'table-filter-view'}>
      {filteredColumns.map(toElement)}
    </ul>
  );
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
