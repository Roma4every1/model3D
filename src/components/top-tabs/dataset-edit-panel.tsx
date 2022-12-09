import { ExportToExcel } from "../forms/dataset/plugins/export-to-excel";
import { SelectAllRec } from "../forms/dataset/plugins/select-all-rec";
import { Statistics } from "../forms/dataset/plugins/statistics";
import { ColumnSettings } from "../forms/dataset/plugins/column-settings";
import { ColumnsVisibility } from "../forms/dataset/plugins/columns-visibility";
import { ColumnHeaderSetter } from "../forms/dataset/plugins/column-header-setter";
import { ColumnSettingsAnalyzer } from "../forms/dataset/plugins/column-settings-analyzer";


export function DataSetEditPanel({formID}: PropsFormID) {
  return (
    <>
      <ExportToExcel formID={formID}/>
      <SelectAllRec formID={formID}/>
      <Statistics formID={formID}/>
      <ColumnSettings formID={formID}/>
      <ColumnsVisibility formID={formID}/>
      <ColumnHeaderSetter formID={formID}/>
      <ColumnSettingsAnalyzer formID={formID}/>
    </>
  );
}
