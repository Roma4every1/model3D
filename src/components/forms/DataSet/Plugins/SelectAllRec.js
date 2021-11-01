import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from "@progress/kendo-react-buttons";

export default function SelectAllRec(props) {
    const { t } = useTranslation();
    const { formId } = props;
    const formRef = useSelector((state) => state.formRefs[formId]);

    const selectAllRec = () => {
        formRef.current.selectAll();
    };

    return <Button className="actionbutton" onClick={selectAllRec}>
        {t('pluginNames.selectAllRec')}
    </Button>
}