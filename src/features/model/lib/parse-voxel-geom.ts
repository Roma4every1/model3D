import { unzipSync } from 'fflate';
import { decodePossiblyCompressed } from './utils';
import type { VoxelGeomFlat } from '../model'; // создадим type
import type { GeomFile } from '../model';
import { parseGeomFile } from './parse-model';

export async function parseVoxelGeomZipFlat(zipData: Blob): Promise<VoxelGeomFlat> {
  const result: VoxelGeomFlat = {};
  const zipBuf = await zipData.arrayBuffer();
  const files = unzipSync(new Uint8Array(zipBuf));

  for (const [filename, buffer] of Object.entries(files)) {
        
    const match = filename.match(/(\d+)-(\d+)-(\d+)\.geom$/); // слой-x-y.geom
    if (!match) continue;

    const layerIndex = parseInt(match[1]);
    const vx = parseInt(match[2]);
    const vy = parseInt(match[3]);
    const key = `${vx}-${vy}`;
    
    const text = decodePossiblyCompressed(buffer);
    try {
        const geomFile = parseGeomFile(text);
        if (!result[layerIndex]) result[layerIndex] = {};
        result[layerIndex][key] = geomFile;
        } catch (e) {
        // console.warn(`Ошибка парсинга ${filename}:`, e);
        }
    }

    return result;
}
