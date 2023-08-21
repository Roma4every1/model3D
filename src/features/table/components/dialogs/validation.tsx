import { TFunction } from 'react-i18next';
import { RowErrors, RowValidationError } from '../../lib/types';
import { DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';


interface ValidationDialogProps {
  errors: RowErrors;
  columns: TableColumnsState;
  t: TFunction;
  onClose: () => void;
}
interface ValidateDetailsProps {
  error: RowValidationError;
  column: TableColumnState;
  t: TFunction;
}


/** Диалог с описанием ошибок при валидации строки. */
export const ValidationDialog = ({errors, columns, t, onClose}: ValidationDialogProps) => {
  const errorToListItem = (error: RowValidationError, i: number) => {
    const column = columns[error.columnID];
    return <ValidateDetails key={i} error={error} column={column} t={t}/>;
  };

  return (
    <>
      <ul style={{overflow: 'auto', maxHeight: 115}}>{errors.map(errorToListItem)}</ul>
      <DialogActionsBar>
        <Button onClick={onClose}>
          {t('base.ok')}
        </Button>
      </DialogActionsBar>
    </>
  );
};

const ValidateDetails = ({error, column, t}: ValidateDetailsProps) => {
  return (
    <li>
      <b>{`"${column.title}": `}</b>
      <span>{t('table.validation-dialog.' + error.type)}</span>
    </li>
  );
};
