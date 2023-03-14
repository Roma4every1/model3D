import { useTranslation } from 'react-i18next';
import { useInternationalization } from '@progress/kendo-react-intl';


interface CellWithLinkedTableProps {
  column: TableColumnState,
  value: any,
  open: () => void,
}


export const LinkedTableCell = ({column, value, open}: CellWithLinkedTableProps) => {
  const { t } = useTranslation();
  const i18nService = useInternationalization();
  const format = column.format;

  const text = value !== null
    ? (format ? i18nService.format(format, value) : value.toString())
    : '';

  return (
    <div className={'linked-table-cell'}>
      <div>
        <span>{text}</span>
      </div>
      <div className={'linked-table-button'} onClick={open}>
        <span
          style={{width: 18, height: 18}}
          className={'k-icon k-i-grid-layout'}
          title={t('table.cells.show-details')}
        />
      </div>
    </div>
  );
};
