import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button } from "@progress/kendo-react-buttons";


export default function ExportToExcel({formId}) {
  const { t } = useTranslation();
  const formRef = useSelector((state: WState) => state.formRefs[formId]);

  return (
    <Button className={'actionbutton'} onClick={() => { formRef.current.excelExport(); }}>
      {t('pluginNames.exportToExcel')}
    </Button>
  );
}
