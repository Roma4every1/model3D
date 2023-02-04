import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BigButton } from '../../../common/menu-ui';
import { Popup } from '@progress/kendo-react-popup';
import ColumnsVisibilityContent from './columns-visibility-content';
import columnVisibilityIcon from '../../../../assets/images/dataset/columns-visibility.png';


export function ColumnsVisibility({formID}: PropsFormID) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);

  const showColumnListClick = (event: MouseEvent) => {
    const target = event.currentTarget;
    if (anchor !== target) setAnchor(target);
    setIsOpen(!isOpen);
  };

  return (
    <>
      <BigButton
        text={t('table.columnsVisibility')} icon={columnVisibilityIcon}
        action={showColumnListClick}
      />
      <Popup className={'popup'} id={formID} show={isOpen} anchor={anchor}>
        <ColumnsVisibilityContent formId={formID} />
      </Popup>
    </>
  );
}
