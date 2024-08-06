/** Запись в очереди обновления параметров. */
export interface ParameterUpdateEntry {
  /** Параметры и их новые значения */
  readonly data: ParameterUpdateData | ParameterUpdateData[];
  /** Функция обратного вызова для разрешения промиса. */
  readonly resolve: () => void;
}

/** Данные для обновления параметра. */
export interface ParameterUpdateData {
  /** ID параметра, который нужно обновить. */
  readonly id: ParameterID;
  /** Новое значение параметра. */
  readonly newValue: any;
}

/* --- DTO --- */

/** DTO параметра сессии. */
export interface ParameterInit {
  id: string;
  type: string;
  value: string | null;
  dependsOn?: string[] | null;
  displayName?: string | null;
  editorType?: string | null;
  editorDisplayOrder?: number | null;
  group?: string | null;
  canBeNull?: boolean | null;
  nullDisplayValue?: string | null;
  showNullValue?: boolean | null;
  externalChannelName?: string | null;
  visibilityString?: string | null;
}

/** DTO группы параметров. */
export interface ParameterGroupDTO {
  /** ID группы; совпадает с полем `group` в DTO параметров. */
  code: string;
  /** Название группы. */
  displayName: string;
}
