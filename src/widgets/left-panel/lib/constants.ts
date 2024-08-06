import type { IGlobalAttributes } from 'flexlayout-react/declarations/model/IJsonModel';


/** Идентификатор корня разметки левой панели. */
export const leftRootID = 'left-root';
/** Минимальная высота набора вкладок. */
export const minTabSetHeight = 75; // px

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

/** Значения по умолчанию для вкладок левой панели. */
export const leftTabInfo = {
  globalParameters: {
    id1: 'root,dockGlobalParameterListSidePanel',
    id2: 'root,dockTreeSidePanel',
    name: 'Параметры',
  },
  presentationParameters: {
    id: 'root,gridPresentationParameterListSidePanel',
    name: 'Параметры презентации',
  },
  presentationTree: {
    id: 'root,dockPresentationsManagerSidePanel',
    name: 'Презентации',
  },
};
