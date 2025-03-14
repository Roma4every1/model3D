import { analyse } from 'chardet';


export async function txtParser(data: Blob): Promise<string> {
  const buffer = await data.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const encoding = detectEncoding(bytes);
  let result: string;

  try {
    result = new TextDecoder(encoding).decode(bytes);
  } catch {
    result = new TextDecoder().decode(bytes);
  }
  return result.replace(/\r\n?/g, '\n');
}

function detectEncoding(bytes: Uint8Array): string | undefined {
  const matches = analyse(bytes);
  for (const match of matches) {
    const name = match.name;
    if (name.startsWith('UTF') || name === 'windows-1251') return name;
    if (match.lang === 'ru') return name;
  }
  return 'windows-1251';
}
