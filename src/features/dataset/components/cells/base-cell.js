import React from 'react';
import { useTranslation } from 'react-i18next';
import { useInternationalization } from '@progress/kendo-react-intl';

import { BooleanCell } from './boolean.cell';
import { DateCell } from './date.cell';
import { DropDownCell } from './drop-down.cell';
import { NumericCell } from './numeric.cell';
import { TextCell } from './text.cell';


export const BaseCell = ({dataItem, format, field, editField, onChange, editor}) => {
  const { t } = useTranslation();
  const intlService = useInternationalization();

  let stringData = '';
  let data = dataItem[field] ?? '';

  if (data !== undefined && data !== null) {
    stringData = format ? intlService.format(format, data) : data.toString();
  }

  /** @type any */
  let element;

  if (dataItem.js_inEdit && editField === field) {
    let CellEditor;
    switch (editor.type) {
      case 'lookup': { CellEditor = DropDownCell; data = editor.values; break; }
      case 'numeric': { CellEditor = NumericCell; break; }
      case 'date': { CellEditor = DateCell; break; }
      case 'boolean': { CellEditor = BooleanCell; break; }
      default: { CellEditor = TextCell; }
    }
    element = <CellEditor data={data} dataItem={dataItem} field={field} onChange={onChange}/>;
  } else {
    element = stringData;
  }

  if ((!(dataItem.js_inEdit && editField === field)) && editor.setOpened) {
    const openNestedForm = () => { editor.setOpened(true); };
    return (
      <div>
        {element}
        <div style={{float: 'right'}}>
          <span
            className={'k-icon k-i-window font-10'}
            title={t('table.showDetailInfo')} onClick={openNestedForm}
          />
        </div>
      </div>
    );
  } else {
    return element;
  }
};
