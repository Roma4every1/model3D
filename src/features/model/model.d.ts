// --- model.d.ts ---

import { ModelLoader } from "./lib/loader";
import { ModelStage } from "./lib/model-stage";


/** Состояние одной 3D-модели */
export interface ModelState {
  id: FormID;
  stage: ModelStage;
  modelId: string | null;
  zoneId: string | null;
  loader: ModelLoader;
  parsedModel: ParsedModel | null;
  geomFiles: VoxelGeomFlat | null;
  parameters: VoxelParameterFlat | null;
  status: 'empty' | 'loading' | 'ok' | 'error';
  usedChannels: ChannelID[];
  canvas: HTMLDivElement | null;
  observer: ResizeObserver;
}
export type VoxelParameterFlat = {
  [paramId: string]: {
    [layerIndex: number]: {
      [key: string]: number[];
    };
  };
};
export interface ParsedModel {
  id: string;
  displayName: string;
  shiftX: number;
  shiftY: number;
  zMultiply: number;
  archived: boolean;
  encrypted: boolean;
  layers: LayerSet[];
  parameters: ParameterDeclaration[];
  wells: Well[];
}

// === Пласты ===

export interface LayerSet {
  id: string;
  displayName: string;
  bounds: LayerBounds;
  prismLayers: PrismLayers;
  prismParameters: PrismParameter[];
}

export interface LayerBounds {
  zMin: number;
  zMax: number;
  points: { x: number; y: number }[];
}

export interface PrismLayers {
  formatId: string;
  count: number;
  geometryFiles: string;
  borderIntersectionMaskFile: string;
  faultsFiles: string;
  x0: number;
  y0: number;
  stx: number;
  sty: number;
  szx: number;
  szy: number;
}

export interface PrismParameter {
  binding: 'prisms' | 'points';
  id: string;
  files: string;
  min: number;
  max: number;
}

// === Объявления параметров ===

export interface ParameterDeclaration {
  id: string;
  displayName: string;
}
export type VoxelParameterFlat = {
  [paramId: string]: {
    [layerIndex: number]: {
      [key: string]: number[];
    };
  };
};

// === Скважины ===

export interface Well {
  id: string;
  name: string;
  source: string;
  files: string;
  intersectionsInfoFiles: string;
  intersections: WellIntersection[];
}

export interface WellIntersection {
  layerSetId: string;
  bl: number;
  br: number;
  bt: number;
  bb: number;
  base: number;
  top: number;
}

// === Геометрия ===

export interface ModelPoint {
  x: number;
  y: number;
  zTop: number;
  zBottom: number;
  id?: number;
}
export interface ModelInclPoint {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  z1: number;
  z2: number;
  id?: number;
}

export interface ModelTriangle {
  p1: number;
  p2: number;
  p3: number;
  marker: 'n' | 'h' | 't' | 'b' | 'a';
  id?: number;
}

export interface ModelSegment {
  p1: number;
  p2: number;
  id?: number;
}

export type VoxelGeomFlat = {
  [layerIndex: number]: {
    [vxVy: string]: GeomFile;
  };
};

export interface GeomFile {
  name?: string;
  points: ModelPoint[];
  triangles: ModelTriangle[];
  segments: ModelSegment[];
}

export interface FaultsFile {
  name?: string;
  points: ModelInclPoint[];
  segments: ModelSegment[];
}

// === BIM ===

/** Возможные типы ячеек BIM-сетки. */
export type BimCellType = '0' | '1' | 'h' | 'n';

/** Одна строка BIM-файла — одномерный массив ячеек (горизонтальный слой). */
export interface BimLayer {
  layer: number;
  values: BimCellType[];
}

/** Полный BIM-файл — массив горизонтальных слоёв. */
export type BimFile = BimLayer[];


// === Параметры ===


export interface GradientVector {
  x: number;
  y: number;
  z: number;
  dx: number;
  dy: number;
  dz: number;
  value: number;
}

export interface ParameterValueFile {
  id: string;                    // Название параметра, например "pres_01122011"
  values: number[];             // Все значения, в зависимости от binding: prisms/points
  binding: 'prisms' | 'points';
  grad?: GradientVector[];      // Если есть файл с градиентами
}

// === Скважины: данные из well и welli ===

export interface InclinationPoint {
  x: number;
  y: number;
  z: number;
  depth: number;
}

export interface PerforationPoint {
  top: number;
  bottom: number;
  type: number;
  date: string;
}

export interface LithologyPoint {
  top: number;
  bottom: number;
  values: number[];
}

export interface LithologySection {
  parameters: string[];
  points: LithologyPoint[];
}

export interface WellGeometry {
  inclination?: InclinationPoint[];
  perforation?: PerforationPoint[];
  lithology?: LithologySection;
}