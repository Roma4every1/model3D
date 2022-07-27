import React from "react";
import { editorsDict } from "../dicts/editors";
import { Label } from "@progress/kendo-react-labels";
import { GridLayout, GridLayoutItem } from "@progress/kendo-react-layout";
import { IntlProvider, LocalizationProvider, loadMessages } from "@progress/kendo-react-intl";
import ErrorBoundary from "../common/ErrorBoundary";
import ruMessages from "../locales/kendoUI/ru.json";


loadMessages(ruMessages, 'ru-RU');
const defaultEditorID = 'stringTextEditor';

export default function BaseEditor(props) {
  const SpecificEditor = editorsDict[props.editorType] || editorsDict[defaultEditorID];

  return (
    <ErrorBoundary>
      <LocalizationProvider language={'ru-RU'}>
        <IntlProvider locale={'ru'}>
          <div className={'parametereditorbox'}>
            <GridLayout gap={{ rows: 1, cols: 2 }}>
              <GridLayoutItem className={'parameterlabel'} row={1} col={1}>
                <Label editorId={props.id}>{props.displayName}</Label>
              </GridLayoutItem>
              <GridLayoutItem row={1} col={2}>
                <SpecificEditor value={props.value} {...props} />
              </GridLayoutItem>
            </GridLayout>
          </div>
        </IntlProvider>
      </LocalizationProvider>
    </ErrorBoundary>
  );
}
