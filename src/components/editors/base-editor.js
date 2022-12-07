import React from "react";
import { editorsDict } from "../../dicts/editors";
import { IntlProvider, LocalizationProvider } from "@progress/kendo-react-intl";


export default function BaseEditor(props) {
  const SpecificEditor = editorsDict[props.editorType] || editorsDict['stringTextEditor'];

  return (
    <LocalizationProvider language={'ru-RU'}>
      <IntlProvider locale={'ru'}>
        <div>
          <span className={'parameter-label'}>{props.displayName}</span>
          <SpecificEditor {...props} />
        </div>
      </IntlProvider>
    </LocalizationProvider>
  );
}
