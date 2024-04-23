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
