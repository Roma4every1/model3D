import { useDispatch } from 'react-redux';
import { TFunction, useTranslation } from 'react-i18next';
import { RowErrors, RowValidationError } from '../../lib/types';
import { Window, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { setOpenedWindow } from 'entities/windows';


interface ValidationDialogProps {
  errors: RowErrors,
  columns: TableColumnsState,
}
interface ValidateDetailsProps {
  error: RowValidationError,
  column: TableColumnState,
  t: TFunction,
}


/** Диалог с описанием ошибок при валидации строки. */
export const ValidationDialog = ({errors, columns}: ValidationDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const onClose = () => {
    dispatch(setOpenedWindow('record-validation', false, null));
  };

  const errorToListItem = (error: RowValidationError, i: number) => {
    const column = columns[error.columnID];
    return <ValidateDetails key={i} error={error} column={column} t={t}/>;
  };

  return (
    <Window
      title={t('table.validation-dialog.header')}
      onClose={onClose} width={500} height={250} resizable={false}
    >
      <ul style={{overflow: 'auto', maxHeight: 115}}>{errors.map(errorToListItem)}</ul>
      <DialogActionsBar>
        <Button onClick={onClose}>
          {t('base.ok')}
        </Button>
      </DialogActionsBar>
    </Window>
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
