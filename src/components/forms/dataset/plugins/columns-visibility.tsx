import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Popup } from "@progress/kendo-react-popup";
import ColumnsVisibilityContent from "./columns-visibility-content";
import { dataSetIconsDict } from "../../../../dicts/images";


export function ColumnsVisibility({formID}: PropsFormID) {
  const { t } = useTranslation();
  const [popoverState, setPopoverState] = useState({anchorEl: null, open: false});

  const showColumnListClick = (event) => {
    setPopoverState({anchorEl: event.currentTarget, open: !popoverState.open});
  };

  return (
    <>
      <button className={'map-action'} onClick={showColumnListClick}>
        <div><img src={dataSetIconsDict['visibility']} alt={'visibility'}/></div>
        <div>{t('table.columnsVisibility')}</div>
      </button>
      <Popup className={'popup'} id={formID} show={popoverState.open} anchor={popoverState.anchorEl}>
        <ColumnsVisibilityContent formId={formID} />
      </Popup>
    </>
  );
}
