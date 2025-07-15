import { create } from "zustand";
import { ParsedModel, VoxelGeomFlat, VoxelParameterFlat } from "../model";

type ModelCache = {
  parsedModel: ParsedModel;
  geomFiles: VoxelGeomFlat;
  parameters?: VoxelParameterFlat;
};
export const useModelCacheStore = create((): Record<string, ModelCache> => ({}));