import { TFunction } from 'react-i18next';
import { ThunkDispatch } from 'redux-thunk';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ButtonIconStock } from 'shared/ui';
import { reloadTable } from '../../store/tables.thunks';


interface ReloadButtonProps {
  id: FormID,
  t: TFunction,
}


/** Кнопка перезагрузки данных канала. */
export const ReloadButton = ({id, t}: ReloadButtonProps) => {
  const dispatch = useDispatch<ThunkDispatch<WState, any, any>>();
  const [loading, setLoading] = useState(false);

  const reload = () => {
    setLoading(true);
    dispatch(reloadTable(id)).then(() => setLoading(false));
  };

  return (
    <ButtonIconStock
      icon={'refresh'} title={t('table.toolbar.refresh')}
      action={reload} disabled={loading}
    />
  );
};
