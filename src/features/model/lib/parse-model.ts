import { XMLParser } from 'fast-xml-parser';
import type {
  ParsedModel,
  LayerSet,
  PrismParameter,
  ParameterDeclaration,
  Well,
  WellIntersection,
  GeomFile,
  BimFile,
  FaultsFile,
  ParameterValueFile,
  WellGeometry,
  BimCellType,
  GradientVector
} from '../model';
import { decodePossiblyCompressed } from './utils';

export function parseModelXML(xmlText: string): ParsedModel {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
  const root = parser.parse(xmlText).model;

  const layers: LayerSet[] = (Array.isArray(root.layersSets?.layersSet) ? root.layersSets.layersSet : [root.layersSets?.layersSet ?? []]).map((layer: any): LayerSet => ({
    id: layer.id,
    displayName: layer.displayName,
    bounds: {
      zMin: parseFloat(layer.bounds.zMin),
      zMax: parseFloat(layer.bounds.zMax),
      points: (Array.isArray(layer.bounds.point) ? layer.bounds.point : [layer.bounds.point]).map((pt: any) => ({
        x: parseFloat(pt.x),
        y: parseFloat(pt.y),
      }))
    },
    prismLayers: {
      formatId: layer.prismLayers.formatID,
      count: Number(layer.prismLayers.count),
      geometryFiles: layer.prismLayers.geometryFiles,
      borderIntersectionMaskFile: layer.prismLayers.borderIntersectionMaskFile,
      faultsFiles: layer.prismLayers.faultsFiles,
      x0: parseFloat(layer.prismLayers.x0),
      y0: parseFloat(layer.prismLayers.y0),
      stx: parseFloat(layer.prismLayers.stx),
      sty: parseFloat(layer.prismLayers.sty),
      szx: parseInt(layer.prismLayers.szx),
      szy: parseInt(layer.prismLayers.szy),
    },
    prismParameters: (Array.isArray(layer.prismLayers.prismParameters?.parameter) ? layer.prismLayers.prismParameters.parameter : [layer.prismLayers.prismParameters?.parameter ?? []]).map((param: any): PrismParameter => ({
      binding: param.binding,
      id: param.id,
      files: param.files,
      min: parseFloat(param.min),
      max: parseFloat(param.max),
    })),
  }));

  const parameters: ParameterDeclaration[] = (Array.isArray(root.parameterDeclarations?.parameterDeclaration) ? root.parameterDeclarations.parameterDeclaration : [root.parameterDeclarations?.parameterDeclaration ?? []]).map((param: any) => ({
    id: param.id,
    displayName: param.displayName,
  }));

  const wells: Well[] = (Array.isArray(root.wells?.well) ? root.wells.well : [root.wells?.well ?? []]).map((well: any): Well => ({
    id: well.id,
    name: well.name,
    source: root.wells.source,
    files: root.wells.files,
    intersectionsInfoFiles: root.wells.intersectionsInfoFiles,
    intersections: (Array.isArray(well.intersections?.layerSet) ? well.intersections.layerSet : [well.intersections?.layerSet ?? []]).map((ls: any): WellIntersection => ({
      layerSetId: ls.id,
      bl: parseFloat(ls.bl),
      br: parseFloat(ls.br),
      bt: parseFloat(ls.bt),
      bb: parseFloat(ls.bb),
      base: parseFloat(ls.base),
      top: parseFloat(ls.top),
    }))
  }));

  return {
    id: root.id,
    displayName: root.displayName,
    shiftX: parseFloat(root.shiftX),
    shiftY: parseFloat(root.shiftY),
    zMultiply: parseFloat(root.zMultiply),
    archived: root.archived === 'true',
    encrypted: root.encrypted === 'true',
    layers,
    parameters,
    wells,
  };
}

export function parseGeomFile(text: string): GeomFile {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

  let idx = 0;

  // ===== Parse Points =====
  const points: GeomFile["points"] = [];
  if (!lines[idx].startsWith("P ")) throw new Error("Expected P block");
  const pointCount = parseInt(lines[idx++].slice(2));

  for (let i = 0; i < pointCount; i++) {
    const [x, y, zTop, zBottom, id] = lines[idx++].split(/\s+/).map(Number);
    points.push({ x, y, zTop, zBottom, id });
  }

  // ===== Parse Triangles =====
  const triangles: GeomFile["triangles"] = [];
  if (!lines[idx].startsWith("T ")) throw new Error("Expected T block");
  const triangleCount = parseInt(lines[idx++].slice(2));

  for (let i = 0; i < triangleCount; i++) {
    const parts = lines[idx++].split(/\s+/);
    const [p1, p2, p3] = parts.slice(0, 3).map(Number);
    const marker = parts[3] as GeomFile["triangles"][0]["marker"];
    const id = parts[4] !== undefined ? Number(parts[4]) : undefined;
    triangles.push({ p1, p2, p3, marker, id });
  }

  // ===== Parse Segments =====
  const segments: GeomFile["segments"] = [];
  if (idx < lines.length && lines[idx].startsWith("S ")) {
    const segmentCount = parseInt(lines[idx++].slice(2));
    for (let i = 0; i < segmentCount; i++) {
      const parts = lines[idx++].split(/\s+/);
      const p1 = Number(parts[0]);
      const p2 = Number(parts[1]);
      const id = parts[2] !== undefined ? Number(parts[2]) : undefined;
      segments.push({ p1, p2, id });
    }
  }

  return { points, triangles, segments };
}

/** Парсинг .bim файла */
export function parseBimFile(text: string): BimFile {
  const lines = text.split('\n').filter((l) => l.trim() && !l.startsWith('V'));
  return lines.map((line, i) => ({
    layer: i,
    values: [...line.trim()] as BimCellType[],
  }));
}

/** Парсинг .faults файла (в формате .geom без секции T) */
export function parseFaultFile(text: string, name?: string): FaultsFile {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  let idx = 0;
  if (!lines[idx].startsWith('P ')) throw new Error('Expected P block');
  const pointCount = parseInt(lines[idx++].slice(2));
  const points = lines.slice(idx, idx + pointCount).map((line) => {
    const nums = line.split(/\s+/).map(Number);
    return {
      x1: nums[0], x2: nums[1],
      y1: nums[2], y2: nums[3],
      z1: nums[4], z2: nums[5],
    };
  });
  idx += pointCount;

  // ===== Parse Segments =====
  const segments: FaultsFile["segments"] = [];
  if (idx < lines.length && lines[idx].startsWith("S ")) {
    const segmentCount = parseInt(lines[idx++].slice(2));
    for (let i = 0; i < segmentCount; i++) {
      const parts = lines[idx++].split(/\s+/);
      const p1 = Number(parts[0]);
      const p2 = Number(parts[1]);
      const id = parts[2] !== undefined ? Number(parts[2]) : undefined;
      segments.push({ p1, p2, id });
    }
  }
  return { name, points, segments };
}


/** Парсинг файла с градиентами параметров (_grad) */
export function parseGradientFile(text: string): GradientVector[] {
  const lines = text.split('\\n').map((l) => l.trim()).filter(Boolean);
  const header = lines[0];
  if (!header.startsWith('V')) throw new Error('Неверный формат градиентного файла');

  return lines.slice(1).map((line) => {
    const [x, y, z, dx, dy, dz, value] = line.split(/\\s+/).map(Number);
    return { x, y, z, dx, dy, dz, value };
  });
}

/** Парсинг .well файла */
export function parseWellFile(text: string): WellGeometry {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const well: WellGeometry = {};

  let section: 'I' | 'P' | 'L' | null = null;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('I')) {
      section = 'I';
      const count = parseInt(line.split(/\s+/)[1]);
      const inclination = lines.slice(i + 1, i + 1 + count).map((l) => {
        const [x, y, z, d] = l.split(/\s+/).map(Number);
        return {inclination: { x, y, z, depth: d }};
      });
      i += count + 1;
    } else if (line.startsWith('P')) {
      section = 'P';
      const count = parseInt(line.split(/\s+/)[1]);
      const perforation = lines.slice(i + 1, i + 1 + count).map((l) => {
        const [top, bottom, type, date] = l.split(/\s+/);
        return {perforation: { top: +top, bottom: +bottom, type, date }};
      });
      i += count + 1;
    } else if (line.startsWith('L')) {
      section = 'L';
      const [_, countStr, ...headers] = line.split(/\s+/);
      const count = parseInt(countStr);
      const lithology = lines.slice(i + 1, i + 1 + count).map((l) => {
        const [top, bottom, ...rest] = l.split(/\s+/).map(Number);
        return {lithology: { top, bottom, values: rest }};
      });
      i += count + 1;
    } else {
      i++;
    }
  }
  return {};
}

/** При необходимости — парсинг welli файла */
export function parseWellInfoFile(text: string): unknown {
  // пока оставим заглушкой, можно будет внедрить позже
  return {};
}