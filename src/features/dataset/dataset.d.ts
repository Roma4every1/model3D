/** Хранилище состояний таблиц (dataset). */
type TablesState = FormDict;

/* --- Settings --- */

/** Настройки формы **DataSet**. */
interface DataSetFormSettings {
  id: FormID,
  columns: DataSetColumnsSettings,
  attachedProperties: DataSetAttachedProperties,
}

interface DataSetAttachedProperties {
  attachOption: string,
  exclude: string[],
}

interface DataSetColumnsSettings {
  columnsSettings: DataSetColumnSettings[],
  frozenColumnCount: number,
  canUserFreezeColumns: boolean,
  isTableMode: boolean,
  alternate: boolean,
  alternateRowBackground: any
}

interface DataSetColumnSettings {
  channelPropertyName: string,
  displayName: string,
  headerBackground: string,
  headerForeground: string,
  background: string,
  foreground: string,
  typeFormat: any,
  width: number,
  isReadOnly: boolean,
  isHeaderRotated: boolean,
  hideIfEmpty: boolean,
  displayIndex: number,
  isVisible: boolean,
  isContainsSearchMode: boolean
}
