import { unzipSync } from 'fflate';
import { decodePossiblyCompressed } from './utils';

export type VoxelParameterFlat = {
  [paramId: string]: {
    [layerIndex: number]: {
      [key: string]: number[];
    };
  };
};

/** Парсит ZIP-файл параметров в плоскую структуру. */
export async function parseVoxelParameterZipFlat(
  zipData: Blob,
  parameterId: string,
  binding: 'prisms' | 'points'
): Promise<VoxelParameterFlat> {
  const result: VoxelParameterFlat = {
    [parameterId]: {},
  };

  const paramsZip = await zipData.arrayBuffer();
  const files = unzipSync(new Uint8Array(paramsZip));
  const valuePerPrism = binding === 'prisms' ? 2 : 4;

  for (const [filename, buffer] of Object.entries(files)) {
    const match = filename.match(/(\d+)-(\d+)-(\d+)\.[^.]+$/);
    if (!match) continue;

    const layerIndex = parseInt(match[1]);
    const vx = parseInt(match[2]);
    const vy = parseInt(match[3]);
    const key = `${vx}-${vy}`;

    const text = decodePossiblyCompressed(buffer);
    const values = text.trim().split(/\s+/).map(Number);

    if (!result[parameterId][layerIndex]) {
      result[parameterId][layerIndex] = {};
    }

    result[parameterId][layerIndex][key] = values;
  }

  return result;
}
