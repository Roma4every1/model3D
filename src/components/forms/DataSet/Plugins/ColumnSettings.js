import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { actions } from "../../../../store";
import {loadMessages} from "@progress/kendo-react-intl";
import ruMessages from "../../../../locales/ru/kendo-ui.json";

loadMessages(ruMessages, "ru-RU");


/** Меняет индексы колонок, чтобы выбранная ушла на 1 шаг влево. */
const toLeft = (colSettings, cell, index, count) => {
    if (!(index > count && index < colSettings.length)) return;
    colSettings[index].displayIndex--;
    colSettings[index - 1].displayIndex++;
}

/** Меняет индексы колонок, чтобы выбранная ушла на 1 шаг вправо. */
const toRight = (colSettings, cell, index, count) => {
    if (!(index >= count && index < colSettings.length)) return;
    colSettings[index].displayIndex++;
    colSettings[index + 1].displayIndex--;
}

/** Меняет индексы колонок, чтобы выбранная ушла в начало, а другие сместились. */
const toStart = (colSettings, cell, index, count) => {
    if (!(index > count && index < colSettings.length)) return;
    colSettings[index].displayIndex = count;
    for(let i = count; i < index; i++) {
        colSettings[i].displayIndex++;
    }
}

/** Меняет индексы колонок, чтобы выбранная ушла в конец, а другие сместились. */
const toEnd = (colSettings, cell, index, count) => {
    if (!(index >= count && index < colSettings.length)) return;
    colSettings[index].displayIndex = colSettings.length - 1;
    for(let i = index + 1; i < colSettings.length; i++) {
        colSettings[i].displayIndex--;
    }
}


export default function ColumnSettings(props) {
    const dispatch = useDispatch();
    const { formId } = props;
    const formRef = useSelector((state) => state.formRefs[formId]);
    const tableSettings = useSelector((state) => state.formSettings[formId]);

    const setFrozenCount = () => {
        tableSettings.columns.frozenColumnCount = 1 + tableSettings.columns.columnsSettings.findIndex((c) => {
            return c.channelPropertyName === formRef.current.activeCell().column;
        });
        dispatch(actions.setFormSettings(formId, { ...tableSettings }));
    }

    const moveColumnTo = (where) => {
        const cell = formRef.current.activeCell();
        const colSettings = tableSettings.columns.columnsSettings;
        if (!colSettings || !cell) return;

        const index = colSettings.findIndex(c => c.channelPropertyName === cell.column);
        const count = tableSettings.columns.frozenColumnCount;

        colSettings.forEach((c, i) => c.displayIndex = i);
        switch (where) {
            case 'start': { toStart(colSettings, cell, index, count); break }
            case 'left': { toLeft(colSettings, cell, index, count); break }
            case 'right': { toRight(colSettings, cell, index, count); break }
            case 'end': { toEnd(colSettings, cell, index, count); break }
            default: {}
        }
        dispatch(actions.setFormSettings(formId, { ...tableSettings }));
    };

    return (
        <div>
            <button
              className="k-button k-button-clear" title="В начало"
              onClick={() => moveColumnTo('start')}
            >
                <span className="k-icon k-i-arrow-double-60-left" />
            </button>
            <button
              className="k-button k-button-clear" title="Влево"
              onClick={() => moveColumnTo('left')}
            >
                <span className="k-icon k-i-arrow-60-left" />
            </button>
            <button
              className="k-button k-button-clear" title="Вправо"
              onClick={() => moveColumnTo('right')}
            >
                <span className="k-icon k-i-arrow-60-right" />
            </button>
            <button
              className="k-button k-button-clear" title="В конец"
              onClick={() => moveColumnTo('end')}
            >
                <span className="k-icon k-i-arrow-double-60-right" />
            </button>
            <button
              className="k-button k-button-clear" title="Закрепить столбцы до выбранного"
              onClick={() => setFrozenCount()}
            >
                <span className="k-icon k-i-pin" />
            </button>
        </div>
    );
}