/** Получает матрицу значний CSV таблицы из строки,
 * учитывая случай запятой внутри кавычек. */
export async function csvParser(data: Blob): Promise<FileModelCSV> {
  const source = await data.text();
  const rows = source.split('\n');
  const result: FileModelCSV = [];

  for (const row of rows) {
    let insideQuotes = false;
    let currentFieldChars : string[] = [];
    const fields: string[] = [];

    for (const char of row) {
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        fields.push(currentFieldChars.join(''));
        currentFieldChars = [];
      } else {
        currentFieldChars.push(char);
      }
    }
    if (currentFieldChars.length) fields.push(currentFieldChars.join(''));

    result.push(fields);
  }
  return result;
}
