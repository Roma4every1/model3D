import { ModelStage } from "../lib/model-stage";
import { useModelCacheStore } from "./model-cache.store";
import { setModelStatus } from "./model.actions";
import { useModelStore } from "./model.store";

export async function updateModel(id: FormID, modelChannel: Channel): Promise<void> {
  const state = useModelStore.getState()[id];
  const cacheStore = useModelCacheStore.getState();
  if (!state) return;

  const channelData = modelChannel?.data;
  if (!channelData) {
    setModelStatus(id, 'empty');
    return;
  }

  const row = channelData?.rows?.at(0);
  if (!row) {
    setModelStatus(id, 'empty');
    return;
  }

  const modelId = row[0];
  const zoneId = row[1];

  
  setModelStatus(id, 'loading');
  const cached = cacheStore[modelId];
  const stage: ModelStage = new ModelStage();
  if (cached) {
    const {parsedModel, parameters, geomFiles} = cached;
    // ✅ модель есть в кэше
    useModelStore.setState({
      [id]: {
        ...state,
        stage,
        parsedModel,
        parameters,
        geomFiles,
        modelId,
        zoneId,
        status: 'ok',
      },
    });

    
    const { canvas } = state;

    // ВНИМАНИЕ: ждём canvas
    if (canvas && stage.initialized && parsedModel && geomFiles && parameters) {
          console.log('Если модель уже загружена', state);
      stage.renderScene();
    }

    return;
  }

  try {
    const { parsedModel, geomFiles } = await state.loader.loadBaseModelData(modelId, zoneId);

    // ✅ положили в глобальный кэш
    useModelCacheStore.setState({
      [modelId]: { parsedModel, geomFiles },
    });

  
    useModelStore.setState({
      [id]: {
        ...state,
        stage,
        modelId,
        zoneId,
        parsedModel,
        geomFiles,
        status: 'ok',
      },
    });

    // ВНИМАНИЕ: ждём canvas
    if (state.canvas && stage.initialized) {
      stage.setData(parsedModel, geomFiles);
    }

  } catch (e) {
    console.warn('Ошибка загрузки модели:', e);
    setModelStatus(id, 'error');
  }
}
