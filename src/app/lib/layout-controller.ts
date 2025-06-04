import type { IJsonModel, IJsonBorderNode, IJsonTabSetNode, IJsonTabNode, IGlobalAttributes } from 'flexlayout-react/declarations/model/IJsonModel';
import { Model, BorderNode, Actions, DockLocation } from 'flexlayout-react';
import { compareArrays } from 'shared/lib';


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
  'top-profile': { // панель настроек профиля
    type: 'tab', enableDrag: false,
    id: 'top-profile', name: 'Профиль',
  },
  'top-trace': { // панель настроек трассы
    type: 'tab', enableDrag: false,
    id: 'top-trace', name: 'Трасса',
  },
  'top-selection': { // панель настроек выборки
    type: 'tab', enableDrag: false,
    id: 'top-selection', name: 'Выборка',
  },
  'top-site': { // панель настроек участка
    type: 'tab', enableDrag: false,
    id: 'top-site', name: 'Участок',
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
  /** Активные объектов в системе. */
  public objects: Set<string>;

  private initTop: number;
  private initRight: number;

  constructor(init: any, popup: boolean) {
    this.model = this.createInitModel(init, popup);
    this.objects = new Set();
    [this.topBorder, this.rightBorder] = this.model.getBorderSet().getBorders();
  }

  public showTab(tabID: TabID, index: number = -1, select: boolean = false): void {
    const isTop = tabID.startsWith('top');
    const border = isTop ? this.topBorder : this.rightBorder;

    if (border.getChildren().every(c => c.getId() !== tabID)) {
      const tab = isTop ? topTabDict[tabID] : rightTabDict[tabID];
      this.model.doAction(Actions.addNode(tab, border.getId(), DockLocation.CENTER, index, select));
    } else if (select && border.getSelected() !== index) {
      this.model.doAction(Actions.selectTab(tabID));
    }
  }

  public updateTabVisibility(presentation: PresentationState): void {
    if (!this.rightBorder || !presentation) return;
    const types = presentation.childrenTypes;
    this.updateTopTabs(types);
    this.updateRightTabs(types);
  }

  public updateTraceEditTabVisibility(need: boolean): void {
    if (!this.rightBorder || !this.objects.has('trace')) return;
    const tabID: TabID = 'right-trace';
    const hasTab = this.rightBorder.getChildren().some(c => c.getId() === tabID);

    if (need && !hasTab) {
      const borderID = this.rightBorder.getId();
      this.model.doAction(Actions.addNode(rightTabDict[tabID], borderID, DockLocation.RIGHT, -1, true))
    }
    if (!need && hasTab) {
      this.model.doAction(Actions.selectTab(tabID));
      this.model.doAction(Actions.deleteTab(tabID));
    }
  }

  private updateTopTabs(types: ReadonlySet<ClientType>): void {
    const oldTabs: TabID[] = this.topBorder.getChildren().map(c => c.getId());
    const newTabs: TabID[] = ['menu'];

    if (types.has('dataSet')) newTabs.push('top-table');
    if (types.has('chart')) newTabs.push('top-chart');
    if (types.has('map')) newTabs.push('top-map');
    if (types.has('carat')) newTabs.push('top-track', 'top-carat');
    if (types.has('profile')) newTabs.push('top-profile');

    if (this.objects.has('trace') && (types.has('map') || types.has('carat'))) newTabs.push('top-trace');
    if (this.objects.has('selection')) newTabs.push('top-selection');
    if (this.objects.has('site')) newTabs.push('top-site');

    if (compareArrays(oldTabs, newTabs)) return;
    const oldSelected = this.topBorder.getSelected();
    this.setBorderTabs(this.topBorder, oldTabs, newTabs);

    if (this.initTop !== null) {
      const tab = newTabs[this.initTop];
      if (tab) this.model.doAction(Actions.selectTab(tab));
      this.initTop = null;
    } else if (oldSelected !== -1) {
      const oldTab = oldTabs[oldSelected];
      const newTab = newTabs.includes(oldTab) ? oldTab : 'menu';
      this.model.doAction(Actions.selectTab(newTab));
    }
  }

  private updateRightTabs(types: ReadonlySet<ClientType>): void {
    const oldTabs: TabID[] = this.rightBorder.getChildren().map(c => c.getId());
    const newTabs: TabID[] = ['right-dock'];

    if (types.has('map')) newTabs.push('right-map');
    if (types.has('profile')) newTabs.push('right-profile');
    if (oldTabs.includes('right-trace')) newTabs.push('right-trace');

    if (compareArrays(oldTabs, newTabs)) return;
    const oldSelected = this.rightBorder.getSelected();
    this.setBorderTabs(this.rightBorder, oldTabs, newTabs);

    if (this.initRight !== null) {
      const tab = newTabs[this.initRight];
      if (tab) this.model.doAction(Actions.selectTab(tab))
      this.initRight = null;
    } else if (oldSelected !== -1) {
      const oldTab = oldTabs[oldSelected];
      if (newTabs.includes(oldTab)) this.model.doAction(Actions.selectTab(oldTab));
    }
  }

  private setBorderTabs(border: BorderNode, oldTabs: TabID[], newTabs: TabID[]): void {
    const model = border.getModel();
    const borderID = border.getId();
    const tabs = newTabs[0].charCodeAt(0) === 109 /* m */ ? topTabDict : rightTabDict;

    for (const id of oldTabs) {
      model.doAction(Actions.deleteTab(id));
    }
    for (const id of newTabs) {
      model.doAction(Actions.addNode(tabs[id], borderID, DockLocation.CENTER, -1, false));
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
    this.initTop = init?.selectedtop ?? -1;
    this.initRight = init?.selectedright ?? -1;
    const topPanelHeight = 90;
    const leftPanelWidth = init?.sizeleft || 250;
    const rightPanelWidth = init?.sizeright || 250;

    const topBorder: IJsonBorderNode = {
      type: 'border', location: 'top',
      barSize: 26, size: topPanelHeight, minSize: topPanelHeight,
      className: 'no-user-select', children: [topTabDict['menu']],
      selected: this.initTop < 1 ? this.initTop : -1,
    };
    const rightBorder: IJsonBorderNode = {
      type: 'border', location: 'right',
      barSize: 26, size: rightPanelWidth, minSize: 150,
      className: 'no-user-select', children: [rightTabDict['right-dock']],
      selected: this.initRight < 1 ? this.initRight : -1,
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
