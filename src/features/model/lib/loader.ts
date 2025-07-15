import { ParsedModel, GeomFile, FaultsFile, BimFile, ParameterValueFile, WellGeometry, VoxelGeomFlat, PrismParameter } from '../model';
import { parseModelXML, parseBimFile, parseFaultFile, parseWellFile, parseWellInfoFile, parseGradientFile } from './parse-model';
import { decodePossiblyCompressed, unzipAndParseBimFile, unzipAndParseWellFiles } from '../lib/utils';
import { programAPI } from 'entities/program';
import { unzipSync } from 'fflate';
import { saveAs } from '@progress/kendo-file-saver';
import {  parseVoxelParameterZipFlat, VoxelParameterFlat } from './parse-voxel-parameter';
import { parseVoxelGeomZipFlat } from './parse-voxel-geom';

export class ModelLoader {
  private readonly formID: FormID;

  constructor(formID: FormID) {
    this.formID = formID;
  }

  /** Загружает модель без параметров. */
  async loadBaseModelData(modelId: string, zoneId: string): Promise<{
    parsedModel: ParsedModel;
    geomFiles: VoxelGeomFlat;
    faults: FaultsFile[];
    bimFiles: BimFile[];
    wells: WellGeometry[];
  }> {
    const basePath = `ModelBuffer/${modelId.split("\\")[0]}/`;

    const xmlRes = await programAPI.downloadFile(`ModelBuffer/${modelId}`);
    const xmlText = new TextDecoder().decode(await xmlRes.data.arrayBuffer());
    const parsedModel = parseModelXML(xmlText);

    const geomRes = await programAPI.downloadFile(`${basePath}${zoneId}geom.bin`);
    const geomFiles = await parseVoxelGeomZipFlat(geomRes.data);

    const faults: FaultsFile[] = [];
    for (const layer of parsedModel.layers) {
      const faultFile = layer.prismLayers.faultsFiles.split(':')[0];
      const faultsRes = await programAPI.downloadFile(`${basePath}${faultFile}`);
      const faultsZip = await faultsRes.data.arrayBuffer();
      const files = unzipSync(new Uint8Array(faultsZip));
      for (const [name, data] of Object.entries(files)) {
        if (name.endsWith('.faults')) {
          faults.push(parseFaultFile(decodePossiblyCompressed(data), name));
        }
      }
    }

    const bimFile = parsedModel.layers[0]?.prismLayers.borderIntersectionMaskFile.split(':')[0];
    const bimRes = await programAPI.downloadFile(`${basePath}${bimFile}`);
    const bimFiles = await unzipAndParseBimFile(bimRes.data);

    const wells: WellGeometry[] = []; // TODO: загрузка скважин, если потребуется

    return {
      parsedModel,
      geomFiles,
      faults,
      bimFiles,
      wells,
    };
  }

  /**
   * Загружает один параметр по ID.
   * @param modelId Модель
   * @param param Параметр (объект из parsedModel)
   */
  async loadParameter(modelId: string, param: PrismParameter): Promise<VoxelParameterFlat> {
    const basePath = `ModelBuffer/${modelId.split("\\")[0]}/`;
    const paramBase = param.files.split(':')[0];
    const paramPath = `${basePath}${paramBase}`;

    const res = await programAPI.downloadFile(paramPath);
    const flat = await parseVoxelParameterZipFlat(res.data, param.id, param.binding);
    return flat;
  }

  /**
   * Загружает все параметры конкретной группы и даты.
   * Например: группа `soil`, дата `01122011`
   */
  async loadParameterGroup(
    modelId: string,
    parsedModel: ParsedModel,
    groupPrefix: string,
    dateSuffix: string
  ): Promise<VoxelParameterFlat> {
    const merged: VoxelParameterFlat = {};

    for (const param of parsedModel.layers.flatMap(l => l.prismParameters)) {
      const isTarget =
        param.id.startsWith(groupPrefix) && param.id.includes(dateSuffix);
      if (!isTarget) continue;

      const single = await this.loadParameter(modelId, param);
      for (const [paramId, layers] of Object.entries(single)) {
        if (!merged[paramId]) merged[paramId] = {};
        for (const [layerIndexStr, cells] of Object.entries(layers)) {
          const layerIndex = Number(layerIndexStr);
          if (!merged[paramId][layerIndex]) merged[paramId][layerIndex] = {};
          Object.assign(merged[paramId][layerIndex], cells);
        }
      }
    }

    return merged;
  }
}

