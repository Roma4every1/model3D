import { detect } from 'chardet';


export async function txtParser(data: Blob): Promise<string> {
  const buffer = await data.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const detectedEncoding = detect(bytes);
  let result: string;

  try {
    result = new TextDecoder(detectedEncoding).decode(bytes);
  } catch {
    result = new TextDecoder().decode(bytes);
  }
  return result.replace(/\r\n?/g, '\n');
}
