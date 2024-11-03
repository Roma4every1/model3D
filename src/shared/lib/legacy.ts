/** Отображение идентификаторов типов .NET в используемый формат. */
const netTypeDict: Record<string, DataTypeName> = {
  'System.Boolean': 'boolean',
  'System.SByte': 'i8',
  'System.Int16': 'i16',
  'System.Int32': 'i32',
  'System.Int64': 'i64',
  'System.Byte': 'u8',
  'System.UInt16': 'u16',
  'System.UInt32': 'u32',
  'System.UInt64': 'u64',
  'System.Single': 'f32',
  'System.Double': 'f64',
  'System.Decimal': 'f64',
  'System.String': 'string',
  'System.DateTime': 'date',
  'System.Byte[]': 'blob',
  'System.DBNull': 'null',
};

const allTypes: Set<DataTypeName> = new Set([
  'boolean', 'i8', 'i16', 'i32', 'i64', 'u8', 'u16', 'u32', 'u64',
  'f32', 'f64', 'string', 'date', 'datetime', 'blob', 'null',
]);

export function getDataTypeName(input: string): DataTypeName | null {
  const name = netTypeDict[input];
  if (name) return name;
  if (allTypes.has(input as any)) return input as DataTypeName;
  return null;
}

/** Проверяет, является ли тип данных колонки численным. */
export function isNumberColumn(column: ChannelColumn): boolean {
  const type = getDataTypeName(column.type);
  if (type === null) return false;
  return /^[iuf]\d/.test(type);
}

/** Проверяет, является ли тип данных колонки датой. */
export function isDateColumn(column: ChannelColumn): boolean {
  const type = getDataTypeName(column.type);
  return type === 'date';
}

/* --- --- */

/**
 * В серверных конфигах при наличии альфа-канала используется фомат `#ARGB`.
 * @example
 * fixColorHEX('#aaa') => '#aaa'
 * fixColorHEX('#AA808080') => '#808080AA'
 */
export function fixColorHEX(color: string): ColorString {
  if (!color || color.length !== 9 || color.charCodeAt(0) !== 0x23) return color;
  return '#' + color.substring(3) + color.substring(1, 3);
}

/**
 * В серверных конфигах при наличии альфа-канала используется фомат `#ARGB`.
 * @example
 * toServerColorFormat('#aaa') => '#aaa'
 * toServerColorFormat('#808080AA') => '#AA808080'
 */
export function toServerColorFormat(color: ColorString): string {
  if (!color || color.length !== 9 || color.charCodeAt(0) !== 0x23) return color;
  return '#' + color.substring(7, 9) + color.substring(1, 7);
}
