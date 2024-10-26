import type { IJsonModel, IJsonBorderNode, IJsonTabSetNode, IJsonTabNode, IGlobalAttributes } from 'flexlayout-react/declarations/model/IJsonModel';
import { Model, BorderNode, Actions, DockLocation } from 'flexlayout-react';


/** Иднентификатор вкладки. */
type TabID = string;

/** Список всех возможных вкладок сверху. */
const topTabDict: Record<TabID, IJsonTabNode> = {
  'menu': { // вкладка "Главная"
    type: 'tab', enableDrag: false,
    id: 'menu', name: 'Главная',
  },
  'top-table': { // панель настроек таблицы
    type: 'tab', enableDrag: false,
    id: 'top-table', name: 'Таблица',
  },
  'top-chart': { // панель настроек графика
    type: 'tab', enableDrag: false,
    id: 'top-chart', name: 'График',
  },
  'top-map': { // панель настроек карты
    type: 'tab', enableDrag: false,
    id: 'top-map', name: 'Карта',
  },
  'top-track': { // панель настроек трека, относится к каротажу
    type: 'tab', enableDrag: false,
    id: 'top-track', name: 'Трек',
  },
  'top-carat': { // настройки непосредственно каротажа
    type: 'tab', enableDrag: false,
    id: 'top-carat', name: 'Каротаж',
  },
  'top-trace': { // панель настроек трассы
    type: 'tab', enableDrag: false,
    id: 'top-trace', name: 'Трасса',
  },
};

/** Список всех возможных вкладок справа. */
const rightTabDict: Record<TabID, IJsonTabNode> = {
  'right-dock': { // активные отчёты
    type: 'tab', enableDrag: false,
    id: 'right-dock', name: 'Отчёты',
  },
  'right-map': { // вкладка со слоями карты
    type: 'tab', enableDrag: false,
    id: 'right-map', name: 'Слои карты',
  },
  'right-trace': {
    type: 'tab', enableDrag: false,
    id: 'right-trace', name: 'Редактирование трассы',
  },
  'right-profile': {
    type: 'tab', enableDrag: false,
    id: 'right-profile', name: 'Параметры профиля',
  },
};


/** Класс, управляющий разметкой всего приложения. */
export class LayoutController {
  /** Модель разметки. */
  public readonly model: Model;
  /** Узел модели разметки, содержащий вкладки сверху. */
  public readonly topBorder: BorderNode;
  /** Узел модели разметки, содержащий вкладки справа. */
  public readonly rightBorder: BorderNode;

  /** Существуют ли в системе трассы. */
  public traceExist: boolean;
  /** Видимые вкладки сверху. */
  private readonly visibleTopIDs: Set<TabID>;
  /** Видимые вкладки справа. */
  private readonly visibleRightIDs: Set<TabID>;

  constructor(init: any, popup: boolean) {
    this.model = this.createInitModel(init, popup);
    this.visibleTopIDs = new Set(['menu']);
    this.visibleRightIDs = new Set(['right-dock']);
    [this.topBorder, this.rightBorder] = this.model.getBorderSet().getBorders();
  }

  public showTab(tabID: TabID, index: number = -1, select: boolean = false): void {
    const isTop = tabID.startsWith('top');
    const visibleIDs = isTop ? this.visibleTopIDs : this.visibleRightIDs;
    const border = isTop ? this.topBorder : this.rightBorder;

    if (!visibleIDs.has(tabID)) {
      visibleIDs.add(tabID);
      const tab = isTop ? topTabDict[tabID] : rightTabDict[tabID];
      this.model.doAction(Actions.addNode(tab, border.getId(), DockLocation.CENTER, index, select));
    } else if (select && border.getSelected() !== index) {
      this.model.doAction(Actions.selectTab(tabID));
    }
  }

  public updateTabVisibility(presentation: PresentationState): void {
    if (!this.rightBorder) return;
    const types = presentation?.childrenTypes;
    if (types) {
      const oldTopIndex = this.topBorder.getSelected();
      const oldTopTabID = oldTopIndex > 0
        ? this.topBorder.getChildren()[oldTopIndex].getId()
        : null; // для -1, 0, обработка не нужна

      this.handleTab('top-table', types.has('dataSet'));
      this.handleTab('top-chart', types.has('chart'));
      this.handleTab('top-map', types.has('map'));
      this.handleTab('top-track', types.has('carat'));
      this.handleTab('top-carat', types.has('carat'));
      this.handleTab('right-map', types.has('map'));
      this.handleTab('right-profile', types.has('profile'));

      const config = this.topBorder.getConfig();
      const initIndex = config.initIndex;
      const currentIndex = this.topBorder.getSelected();

      if (initIndex !== null) {
        const tab = initIndex !== currentIndex && this.topBorder.getChildren()[initIndex];
        if (tab) this.model.doAction(Actions.selectTab(tab.getId()));
        config.initIndex = null;
      }
      else if (oldTopTabID) {
        const currentTabID = this.topBorder.getChildren()[currentIndex].getId();
        const neededTabID = this.visibleTopIDs.has(oldTopTabID) ? oldTopTabID : 'menu';
        if (currentTabID !== neededTabID) this.model.doAction(Actions.selectTab(neededTabID));
      }
    }
    const needTraceTab = this.traceExist && types &&
      (types.has('map') || types.has('carat'));
    this.handleTab('top-trace', needTraceTab);
  }

  public updateTraceEditTabVisibility(need: boolean): void {
    if (!this.rightBorder || !this.traceExist) return;
    const tabID: TabID = 'right-trace';
    const borderID = this.rightBorder.getId();
    const hasTab = this.visibleRightIDs.has(tabID);

    if (need && !hasTab) {
      this.visibleRightIDs.add(tabID);
      this.model.doAction(Actions.addNode(rightTabDict[tabID], borderID, DockLocation.RIGHT, -1, true))
    }
    if (!need && hasTab) {
      this.visibleRightIDs.delete(tabID);
      this.model.doAction(Actions.selectTab(tabID));
      this.model.doAction(Actions.deleteTab(tabID));
    }
  }

  private handleTab(tabID: TabID, need: boolean): void {
    const isTop = tabID.startsWith('top');
    const visibleIDs = isTop ? this.visibleTopIDs : this.visibleRightIDs;

    if (visibleIDs.has(tabID)) {
      visibleIDs.delete(tabID);
      this.model.doAction(Actions.deleteTab(tabID));
    }
    if (need) {
      const tab = isTop ? topTabDict[tabID] : rightTabDict[tabID];
      const borderID = isTop ? this.topBorder.getId() : this.rightBorder.getId();
      visibleIDs.add(tabID);
      this.model.doAction(Actions.addNode(tab, borderID, DockLocation.CENTER, -1, false));
    }
  }

  private createInitModel(init: any, popup: boolean): Model {
    const global: IGlobalAttributes = {
      tabSetEnableTabStrip: false,
      borderEnableDrop: false,
      tabEnableRename: false,
      tabEnableClose: false,
      tabEnableDrag: false,
      tabSetEnableDrag: false,
      splitterSize: 8,
    };
    let layout: IJsonModel;
    if (popup) {
      layout = this.createPopupLayout(global);
    } else {
      layout = this.createMainLayout(init, global);
    }
    return Model.fromJson(layout);
  }

  private createMainLayout(init: any, globalAttributes: IGlobalAttributes): IJsonModel {
    const selectedTop = init?.selectedtop ?? -1;
    const selectedRight = init?.selectedright ?? -1;
    const topPanelHeight = 90;
    const leftPanelWidth = init?.sizeleft ?? 270;
    const rightPanelWidth = init?.sizeright ?? 270;

    const topBorder: IJsonBorderNode = {
      type: 'border', location: 'top',
      barSize: 26, size: topPanelHeight, minSize: topPanelHeight,
      className: 'no-user-select', children: [topTabDict['menu']],
      selected: selectedTop < 1 ? selectedTop : -1, config: {initIndex: selectedTop},
    };
    const rightBorder: IJsonBorderNode = {
      type: 'border', location: 'right',
      barSize: 26, size: rightPanelWidth, minSize: 150,
      className: 'no-user-select', children: [rightTabDict['right-dock']],
      selected: selectedRight < 1 ? selectedRight : -1,
    };

    const leftPanelContent: IJsonTabSetNode = {
      type: 'tabset', width: leftPanelWidth, minWidth: 150,
      children: [{id: 'left', type: 'tab', component: 'left'}],
    };
    const mainContent: IJsonTabSetNode = {
      type: 'tabset', minWidth: 200,
      children: [{type: 'tab', component: 'form'}],
    };
    return {
      global: globalAttributes, borders: [topBorder, rightBorder],
      layout: {type: 'row', children: [leftPanelContent, mainContent]},
    };
  }

  private createPopupLayout(globalAttributes: IGlobalAttributes): IJsonModel {
    const leftBorder: IJsonTabNode = {
      type: 'tab', enableDrag: false,
      id: 'left-border', name: 'Параметры презентации',
    };
    const border: IJsonBorderNode = {
      type: 'border', location: 'left', className: 'no-user-select',
      barSize: 26, size: 200, minSize: 150,
      children: [leftBorder], selected: -1,
    };
    const content: IJsonTabSetNode = {
      type: 'tabset', minWidth: 200,
      children: [{type: 'tab', component: 'form'}],
    };
    return {
      global: globalAttributes, borders: [border],
      layout: {type: 'row', children: [content]},
    };
  }
}
