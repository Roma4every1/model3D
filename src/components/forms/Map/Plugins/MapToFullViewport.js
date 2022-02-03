import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

export default function MapToFullviewport(props) {
    const { t } = useTranslation();
    const { formId } = props;
    const formRef = useSelector((state) => state.formRefs[formId]);

    const toFullViewport = () => {
        formRef.current.toFullViewport();
    };

    return <button className="k-button k-button-clear" onClick={toFullViewport} title={t('map.showAll')}>
        <span className="k-icon k-i-zoom-actual-size" />
    </button>
}