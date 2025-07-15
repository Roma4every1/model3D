import { decompressSync, strFromU8, unzipSync } from 'fflate';
import { BimFile, GeomFile, ParameterValueFile, ParsedModel, WellGeometry } from '../model';
import { parseBimFile, parseGeomFile, parseWellFile } from './parse-model';

export function decodePossiblyCompressed(data: Uint8Array): string {
  try {
    const decompressed = decompressSync(data);
    return strFromU8(decompressed);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    
    try {
      return strFromU8(data); 
    } catch (err) {
      console.warn("Невозможно декодировать .geom файл:", err);
      return '';
    }
  }
}

// export async function unzipAndParseGeomFiles(blob: Blob): Promise<GeomFile[]> {
//   const buffer = new Uint8Array(await blob.arrayBuffer());
//   const files = unzipSync(buffer);
//   const geomFiles: GeomFile[] = [];
//   for (const [name, data] of Object.entries(files)) {
//     if (name.endsWith('.geom')) {
//       const text = decodePossiblyCompressed(data); // ← здесь
//       try {
//         geomFiles.push(parseGeomFile(text));
//       } catch (e) {
//         console.warn(`Ошибка парсинга ${name}:`, e);
//       }
//     }
//   }
//   return geomFiles;
// }

export async function unzipAndParseWellFiles(blob: Blob): Promise<WellGeometry[]> {
  const buffer = new Uint8Array(await blob.arrayBuffer());
  const files = unzipSync(buffer);
  const wellFiles: WellGeometry[] = [];
  for (const [name, data] of Object.entries(files)) {
    if (name.endsWith('.well')) {
      const text = decodePossiblyCompressed(data); // ← здесь
      try {
        wellFiles.push(parseWellFile(text));
      } catch (e) {
        console.warn(`Ошибка парсинга ${name}:`, e);
      }
    }
  }
  return wellFiles;
}

// export async function unzipAndParseParamFiles(blob: Blob, id, binding): Promise<ParameterValueFile[]> {
//   const buffer = new Uint8Array(await blob.arrayBuffer());
//   const files = unzipSync(buffer);
//   const paramFiles: ParameterValueFile[] = [];
//   for (const [name, data] of Object.entries(files)) {
//     if (name.endsWith(id)) {
//       const text = decodePossiblyCompressed(data); // ← здесь
//       try {
//         paramFiles.push(parseParamFile(text, id, binding));
//       } catch (e) {
//         console.warn(`Ошибка парсинга ${name}:`, e);
//       }
//     }
//   }
//   return paramFiles;
// }

export async function unzipAndParseBimFile(blob: Blob): Promise<BimFile[]> {
  const buffer = new Uint8Array(await blob.arrayBuffer());
  const files = unzipSync(buffer);
  const bimFiles: BimFile[] = [];
  for (const [name, data] of Object.entries(files)) {
    if (name.endsWith('.bim')) {
      const text = decodePossiblyCompressed(data); // ← здесь
      try {
        bimFiles.push(parseBimFile(text));
      } catch (e) {
        console.warn(`Ошибка парсинга ${name}:`, e);
      }
    }
  }
  return bimFiles;
}

export function extractGroupedParams(parsedModel?: ParsedModel): Record<string, string[]> {
  const result: Record<string, Set<string>> = {};

  if (!parsedModel) return {};

  for (const layer of parsedModel.layers) {
    for (const param of layer.prismParameters) {
      const [group] = param.id.split('_');
      if (!result[group]) result[group] = new Set();
      result[group].add(param.id);
    }
  }

  const output: Record<string, string[]> = {};
  for (const group in result) {
    output[group] = Array.from(result[group]);
  }

  return output;
}

export function extractGroupDates(groupedParams: Record<string, string[]>): Record<string, string[]> {
  const dateMap: Record<string, Set<string>> = {};

  for (const group in groupedParams) {
    for (const paramId of groupedParams[group]) {
      const [, date] = paramId.split('_');
      if (!dateMap[group]) dateMap[group] = new Set();
      dateMap[group].add(date);
    }
  }

  const result: Record<string, string[]> = {};
  for (const group in dateMap) {
    result[group] = Array.from(dateMap[group]).sort(compareDates);
  }

  return result;
}

export function compareDates(a: string, b: string): number {
  const parse = (str: string) => {
    const day = parseInt(str.slice(0, 2), 10);
    const month = parseInt(str.slice(2, 4), 10) - 1; // 0-based month
    const year = parseInt(str.slice(4, 8), 10);
    return new Date(year, month, day);
  };
  return parse(a).getTime() - parse(b).getTime();
}
