import { IGlobalAttributes } from 'flexlayout-react/declarations/model/IJsonModel';


/** Глобальные настройки левой панели. */
export const leftPanelGlobalAttributes: IGlobalAttributes = {
  /** Ориентация корневого узла. */
  rootOrientationVertical: true,
  /** Высота ленты набора вкладок. */
  tabSetTabStripHeight: 26, // px
  /** Возможность переименовывать вкладки. */
  tabEnableRename: false,
  /** Возможность удалять вкладки. */
  tabEnableClose: false,
  /** Возможность перетаскивать вкладки. */
  tabEnableDrag: true,
  /** ??? */
  tabEnableFloat: false,
  /** Ширина линии-разделителя. */
  splitterSize: 6, // px
};

/** Идентификатор корня разметки левой панели. */
export const leftRootID = 'left-root';
/** Минимальная высота набора вкладок. */
export const minTabSetHeight = 75; // px

/** Идентификатор вкладки с глобальными параметрами. */
export const globalParamsTabID = 'dockGlobalParameterListSidePanel';
/** Стандартное название вкладки с глобальными параметрами. */
export const globalParamsName = 'Параметры';

/** Идентификатор вкладки с параметрами презентации. */
export const presentationParamsTabID = 'gridPresentationParameterListSidePanel';
/** Стандартное название вкладки с параметрами презентации. */
export const presentationParamsName = 'Параметры презентации';

/** Идентификатор вкладки со списком презентаций. */
export const presentationTreeTabID = 'dockPresentationsManagerSidePanel';
/** Стандартное название вкладки со списком презентаций. */
export const presentationTreeName = 'Презентации';

/** Словарь ID вкладок. */
export const leftTabIDDict: Record<LeftTabType, string> = {
  global: globalParamsTabID,
  presentation: presentationParamsTabID,
  tree: presentationTreeTabID,
};
