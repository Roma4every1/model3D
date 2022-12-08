import ExportToExcel from "../../components/forms/dataset/plugins/export-to-excel";
import SelectAllRec from "../../components/forms/dataset/plugins/select-all-rec";
import Statistics from "../../components/forms/dataset/plugins/statistics";
import ColumnSettings from "../../components/forms/dataset/plugins/column-settings";
import ColumnsVisibility from "../../components/forms/dataset/plugins/columns-visibility";
import ColumnHeaderSetter from "../../components/forms/dataset/plugins/column-header-setter";
import ColumnSettingsAnalyzer from "../../components/forms/dataset/plugins/column-settings-analyzer";


export default function DataSetEditPanel({formID}: {formID: FormID}) {
  return (
    <>
      <ExportToExcel formId={formID}/>
      <SelectAllRec formId={formID}/>
      <Statistics formId={formID}/>
      <ColumnSettings formId={formID}/>
      <ColumnsVisibility formId={formID}/>
      <ColumnHeaderSetter formId={formID}/>
      <ColumnSettingsAnalyzer formId={formID}/>
    </>
  );
}
