import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Popup } from "@progress/kendo-react-popup";
import { Button } from "@progress/kendo-react-buttons";
import ColumnsVisibilityContent from "./columns-visibility-content";


export function ColumnsVisibility({formID}: PropsFormID) {
  const { t } = useTranslation();
  const [popoverState, setPopoverState] = useState({anchorEl: null, open: false});

  const showColumnListClick = (event) => {
    setPopoverState({anchorEl: event.currentTarget, open: !popoverState.open});
  };

  return (
    <div>
      <Button className={'actionbutton'} onClick={showColumnListClick}>
        {t('table.columnsVisibility')}
      </Button>
      <Popup className={'popup'} id={formID} show={popoverState.open} anchor={popoverState.anchorEl}>
        <ColumnsVisibilityContent formId={formID} />
      </Popup>
    </div>
  );
}
