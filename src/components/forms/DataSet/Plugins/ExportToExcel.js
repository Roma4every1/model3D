import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from "@progress/kendo-react-buttons";

export default function ExportToExcel(props) {
    const { t } = useTranslation();
    const { formId } = props;
    const formRef = useSelector((state) => state.formRefs[formId]);

    const exportToExcel = () => {
        formRef.current.ref.excelExport();
    };

    return <Button className="actionbutton" onClick={exportToExcel}>
        {t('pluginNames.exportToExcel')}
    </Button>
}