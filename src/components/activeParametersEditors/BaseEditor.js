import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { GridLayout, GridLayoutItem } from "@progress/kendo-react-layout";
import { Label } from "@progress/kendo-react-labels";
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
    const { t } = useTranslation();
    var componentPath = 'StringTextEditor';
    if (editors[props.editorType]) {
        componentPath = editors[props.editorType];
    }
    let MyComponent = React.lazy(() => import('./' + componentPath));

    return (
        <ErrorBoundary>
            <Suspense fallback={<p><em>{t('base.loading')}</em></p>}>
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
