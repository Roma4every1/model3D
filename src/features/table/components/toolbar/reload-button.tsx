import { TFunction } from 'react-i18next';
import { useState } from 'react';
import { ButtonIconStock } from 'shared/ui';
import { reloadTable } from '../../store/table.thunks';


interface ReloadButtonProps {
  id: FormID,
  t: TFunction,
}


/** Кнопка перезагрузки данных канала. */
export const ReloadButton = ({id, t}: ReloadButtonProps) => {
  const [loading, setLoading] = useState(false);

  const reload = () => {
    setLoading(true);
    reloadTable(id).then(() => setLoading(false));
  };

  return (
    <ButtonIconStock
      icon={'refresh'} title={t('table.toolbar.refresh')}
      action={reload} disabled={loading}
    />
  );
};
