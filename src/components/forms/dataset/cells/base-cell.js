import React from "react";
import { useTranslation } from 'react-i18next';
import { useInternationalization } from "@progress/kendo-react-intl";

import { BooleanCell } from "./boolean.cell";
import { DateCell } from "./date.cell";
import { DropDownCell } from "./drop-down.cell";
import { NumericCell } from "./numeric.cell";
import { TextCell } from "./text.cell";


export const BaseCell = (props) => {
  const { dataItem, format, setOpened, field, editField } = props;

  const { t } = useTranslation();
  const intlService = useInternationalization();

  let stringData = '';
  let data = dataItem[field] ?? '';

  if (data !== undefined && data !== null) {
    stringData = format ? intlService.format(format, data) : data.toString();
  }

  let element;
  const openNestedForm = () => { setOpened(true); };

  if (dataItem.js_inEdit && editField === field) {
    switch (props.type) {
      case 'lookup':
        element = <DropDownCell {...props} lookupData={props.values} dataValue={data} />;
        break;
      case 'numeric':
        element = <NumericCell {...props} dataValue={data} />;
        break;
      case 'date':
        element = <DateCell {...props} dataValue={data} />;
        break;
      case 'boolean':
        element = <BooleanCell {...props} dataValue={data} />;
        break;
      default:
        element = <TextCell {...props} dataValue={data} />;
        break;
    }
  } else {
    element = stringData;
  }

  if ((!(dataItem.js_inEdit && editField === field)) && setOpened) {
    return (
      <div>
        {element}
        <div className={'buttonCell'}>
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
