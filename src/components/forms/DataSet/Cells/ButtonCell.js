import * as React from "react";
import { useTranslation } from 'react-i18next';

export const ButtonCell = (props) => {
    const { t } = useTranslation();

    const openNestedForm = async () => {
        props.setOpened(true);
    };

    return (
        <div>
            {props.data}
            <div className="buttonCell">
                <span className="k-icon k-i-window font-10" alt={t('table.showDetailInfo')} title={t('table.showDetailInfo')} onClick={openNestedForm} />
            </div>
        </div>
    );
};