/** Модель параметра клиента, приходящая от сервера (WebRequests). */
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
}
