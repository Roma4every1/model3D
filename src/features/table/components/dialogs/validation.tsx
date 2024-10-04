import type { TableColumnDict, RecordViolation } from '../../lib/types';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import './validation.scss';


interface ValidationDialogProps {
  errors: RecordViolation[];
  columns: TableColumnDict;
  onClose: () => void;
}


/** Диалог с описанием ошибок при валидации строки. */
export const ValidationDialog = ({errors, columns, onClose}: ValidationDialogProps) => {
  const { t } = useTranslation();

  const errorToListItem = (error: RecordViolation, i: number) => {
    const column = columns[error.column];
    return (
      <li key={i}>
        <b>{column.displayName}: </b>
        <span>{t('table.validation.' + error.type)}</span>
      </li>
    );
  };

  return (
    <div className={'record-validation-info'}>
      <ul>{errors.map(errorToListItem)}</ul>
      <div className={'wm-dialog-actions'} style={{gridTemplateColumns: '1fr'}}>
        <Button onClick={onClose}>{t('base.ok')}</Button>
      </div>
    </div>
  );
};
