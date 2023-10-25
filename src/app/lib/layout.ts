import { IJsonModel, Model, BorderNode, Actions, DockLocation } from 'flexlayout-react';
import { IJsonTabNode } from 'flexlayout-react/declarations/model/IJsonModel';


/** Иднентификатор вкладки. */
type TabID = string;

/** Список всех возможных вкладок сверху. */
const topTabDict: Record<TabID, IJsonTabNode> = {
  'menu': { // вкладка "Главная"
    type: 'tab', enableDrag: false,
    id: 'menu', name: 'Главная',
  },
  'reports': { // вкладка с программами
    type: 'tab', enableDrag: false,
    id: 'reports', name: 'Программы',
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
};


/** Класс-оболочка для управления разметкой всего приложения. */
export class LayoutManager {
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

  constructor(init: any) {
    this.model = this.createInitModel(init);
    this.visibleTopIDs = new Set(['menu', 'reports']);
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
    const types = presentation?.childrenTypes;
    if (types) {
      const oldTopIndex = this.topBorder.getSelected();
      const oldTopTabID = oldTopIndex > 1
        ? this.topBorder.getChildren()[oldTopIndex].getId()
        : null; // для -1, 0, 1 обработка не нужна

      this.handleTab('top-table', types.has('dataSet'));
      this.handleTab('top-chart', types.has('chart'));
      this.handleTab('top-map', types.has('map'));
      this.handleTab('top-track', types.has('carat'));
      this.handleTab('top-carat', types.has('carat'));
      this.handleTab('right-map', types.has('map'));

      // исходя из UX, вкладка с программами самая популярная,
      // но если последняя открытая осталась, то нужно остаться на ней
      if (oldTopTabID) {
        const currentIndex = this.topBorder.getSelected();
        const currentTabID = this.topBorder.getChildren()[currentIndex].getId();
        const neededTabID = this.visibleTopIDs.has(oldTopTabID) ? oldTopTabID : 'reports';
        if (currentTabID !== neededTabID) this.model.doAction(Actions.selectTab(neededTabID));
      }
    }
    const needTraceTab = this.traceExist && types &&
      (types.has('map') || types.has('carat'));
    this.handleTab('top-trace', needTraceTab);
  }

  public updateTraceEditTabVisibility(need: boolean): void {
    if (!this.traceExist) return;
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

  private createInitModel(init: any): Model {
    const initTopTabs = [topTabDict['menu'], topTabDict['reports']];
    const initRightTabs = [rightTabDict['right-dock']];

    const selectedTopTab = init?.selectedtop ?? -1;
    const selectedRightTab =  init?.selectedright ?? -1;
    const topPanelHeight = 90;
    const leftPanelWidth = init?.sizeleft ?? 270;
    const rightPanelWidth = init?.sizeright ?? 270;

    const layout: IJsonModel = {
      global: {
        tabSetEnableTabStrip: false,
        borderEnableDrop: false,
        tabEnableRename: false,
        tabEnableClose: false,
        tabEnableDrag: false,
        tabSetEnableDrag: false,
        splitterSize: 8,
      },
      borders: [
        {
          type: 'border', location: 'top',
          barSize: 26, size: topPanelHeight, minSize: topPanelHeight,
          className: 'no-user-select', children: initTopTabs,
          selected: selectedTopTab < initTopTabs.length ? selectedTopTab : -1,
        },
        {
          type: 'border', location: 'right',
          barSize: 26, size: rightPanelWidth, minSize: 150,
          className: 'no-user-select', children: initRightTabs,
          selected: selectedRightTab < initRightTabs.length ? selectedRightTab : -1,
        },
      ],
      layout: {
        type: 'row',
        children: [
          {
            type: 'tabset', width: leftPanelWidth, minWidth: 150,
            children: [{id: 'left', type: 'tab', component: 'left'}],
          },
          {
            type: 'tabset', minWidth: 200,
            children: [{type: 'tab', component: 'form'}],
          },
        ],
      },
    };
    return Model.fromJson(layout);
  }
}
