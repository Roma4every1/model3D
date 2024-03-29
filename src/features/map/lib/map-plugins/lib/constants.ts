/** ### Режимы редактирования карты.
 * + `INCLINOMETRY_MODE` — плагин для вертикальной проекции инклинометрии на карте
 * */
export enum PluginNames {
  INCLINOMETRY_MODE = 'InclinometryModePlugin',
}

export enum ConfigPluginNames {
  INCLINOMETRY_MODE = 'wellsLinkedClients',
}

export enum InclModePluginChannelNames {
  INCLINOMETRY = 'Inclinometry',
  VERSIONS = 'InclinometryVersions',
  VERSIONS_PROPS = 'InclinometryVersionsProperties'
}

export enum InclModePluginParamNames {
  VIEW_ANGLE = 'inclinometryViewAngle'
}
