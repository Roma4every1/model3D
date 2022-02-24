import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

export default function LabelPropertiesWindow(props) {
    const { t } = useTranslation();
    const { formId, close, setWindowSize } = props;
    const selectedObject = useSelector((state) => state.formRefs[formId + "_selectedObject"]);

    React.useEffect(() => {
        setWindowSize({ width: 210, height: 210 });
    }, [setWindowSize]);

    return <div />
}