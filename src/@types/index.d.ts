/** Параметр формы. */
interface FormParameter {
  id: ParameterID,
  type: ParameterType,
  value: any,
  formId: FormID,
  editorType: ParameterEditorType,
  editorDisplayOrder: ParameterOrder,
  externalChannelName: ChannelName,
  displayName: string,
  dependsOn: ParameterDepends,
  canBeNull: boolean,
  showNullValue: boolean,
  nullDisplayValue: any,
}

/** Идентификатор формы. */
type FormID = string;

/** Идентификатор канала с данными. */
type ChannelName = string;

/** Идентификатор параметра формы.
 * @see FormParameter
 * */
type ParameterID = string;

/** Тип параметра формы.
 * @see FormParameter
 * */
type ParameterType = string;

/** Тип редактора для данного параметра.
 * @see FormParameter
 * */
type ParameterEditorType = string;

/** Влияет на то, в каком порядке отображать редакторы параметров.
 * @see FormParameter
 * */
type ParameterOrder = number;

/** Список параметров (ID), которые зависят от данного.
 * @see FormParameter
 * */
type ParameterDepends = ParameterID[];

/** Тип формы. */
type FormType = 'carat' | 'chart' | 'dataSet' | 'dock' | 'files' | 'filesList' | 'grid' | 'image' | 'map' |
  'model3D' | 'profile' | 'screenshot' | 'slide' | 'spreadsheet' | 'spreadsheetUnite' | 'transferForm';
