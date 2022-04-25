import React, { Suspense } from 'react';
import { GridLayout, GridLayoutItem } from "@progress/kendo-react-layout";
import { Label } from "@progress/kendo-react-labels";
import { Loader } from "@progress/kendo-react-indicators";
import {
    IntlProvider,
    LocalizationProvider,
    loadMessages,
} from "@progress/kendo-react-intl";
import ErrorBoundary from '../common/ErrorBoundary';
import editors from "./editors.json";
import ruMessages from "../locales/kendoUI/ru.json";
loadMessages(ruMessages, "ru-RU");

export default function BaseEditor(props) {
    var componentPath = 'StringTextEditor';
    if (editors[props.editorType]) {
        componentPath = editors[props.editorType];
    }
    let MyComponent = React.lazy(() => import('./' + componentPath));

    return (
        <ErrorBoundary>
            <Suspense fallback=<Loader size="small" type="infinite-spinner" />>
                <LocalizationProvider language='ru-RU'>
                    <IntlProvider locale='ru'>
                        <div className="parametereditorbox">
                            <GridLayout gap={{ rows: 1, cols: 2 }}>
                                <GridLayoutItem className='parameterlabel' row={1} col={1}>
                                    <Label editorId={props.id}>{props.displayName}</Label>
                                </GridLayoutItem>
                                <GridLayoutItem row={1} col={2}>
                                    <MyComponent value={props.value} {...props} />
                                </GridLayoutItem>
                            </GridLayout>
                        </div>
                    </IntlProvider>
                </LocalizationProvider>
            </Suspense>
        </ErrorBoundary>);
}
