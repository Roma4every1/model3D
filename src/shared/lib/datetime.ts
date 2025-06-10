/**
 * Создаёт объект даты без учёта времени на основе строки.
 * @returns объект даты, если строка распознана, иначе `null`
 */
export function parseDate(input: string): Date | null {
  if (input.length < 10) return null;
  let dateString: string, postfix: string;

  if (input.length > 10) {
    postfix = input.substring(10);
    if (!/^(?:[T ][0-9:]+)?(?: ?\\d)?$/.test(postfix)) return null;
    dateString = input.substring(0, 10);
  } else {
    dateString = input;
  }

  let date: Date;
  if (dateString.charCodeAt(2) === 46) { // expect dd.mm.yyyy
    const year = dateString.substring(6);
    const month = dateString.substring(3, 5);
    const day = dateString.substring(0, 2);
    date = new Date(year + '-' + month + '-' + day);
  } else {
    date = new Date(dateString);
  }

  if (Number.isNaN(date.getTime())) return null;
  if (postfix?.endsWith('d')) date.setDate(1);
  return date;
}

/**
 * Создаёт объект даты с учётом времени на основе строки.
 * @returns объект даты, если строка распознана, иначе `null`
 */
export function parseDateTime(input: string): Date | null {
  if (input.length < 10) return null;
  let date: Date;

  if (input.charCodeAt(2) === 46) { // expect dd.mm.yyyy
    const year = input.substring(6, 10);
    const month = input.substring(3, 5);
    const day = input.substring(0, 2);
    const time = input.substring(11);
    date = new Date(`${year}-${month}-${day}T${time || '00:00:00'}`);
  } else {
    date = new Date(input);
  }

  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/**
 * Сериализует дату в строку в формате `YYYY-MM-DD` без учёта временных зон.
 * @example
 * stringifyLocalDate(new Date(2023, 6, 14)) => "2023-07-14"
 */
export function stringifyLocalDate(date: Date): string {
  const month = date.getMonth() + 1;
  const monthString = month > 9 ? month : '0' + month;
  const day = date.getDate();
  const dayString = day > 9 ? day : '0' + day;
  return `${date.getFullYear()}-${monthString}-${dayString}`;
}

/** Возвращает строку в формате `YYYY-MM-DDThh:mm:ss`. */
export function stringifyLocalDateTime(date: Date): string {
  const month = date.getMonth() + 1;
  const monthString = month > 9 ? month : '0' + month;
  const day = date.getDate();
  const dayString = day > 9 ? day : '0' + day;
  const hours = date.getHours();
  const hh = hours > 9 ? hours : '0' + hours;
  const minutes = date.getMinutes();
  const mm = minutes > 9 ? minutes : '0' + minutes;
  const seconds = date.getSeconds();
  const ss = seconds > 9 ? seconds : '0' + seconds;
  return `${date.getFullYear()}-${monthString}-${dayString}T${hh}:${mm}:${ss}`;
}
