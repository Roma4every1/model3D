import { Model, BorderNode, Actions, DockLocation } from 'flexlayout-react';
import { compareArrays } from 'shared/lib';
import { topTabDict, rightTabDict } from './layout-constants';


/** Иднентификатор вкладки. */
type TabID = string;

/** Класс, управляющий разметкой всего приложения. */
export class MainLayoutController implements IMainLayoutController {
  /** Модель разметки. */
  public readonly model: Model;
  /** Узел модели разметки, содержащий вкладки сверху. */
  public readonly topBorder: BorderNode;
  /** Узел модели разметки, содержащий вкладки справа. */
  public readonly rightBorder: BorderNode;
  /** Активные объекты в системе. */
  public readonly objects: Set<string>;

  private initTop: number;
  private initRight: number;

  constructor(model: Model, initTop: number, initRight: number) {
    this.model = model;
    this.initTop = initTop;
    this.initRight = initRight;
    this.objects = new Set();
    [this.topBorder, this.rightBorder] = model.getBorderSet().getBorders();
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
    if (types.has('model3D')) newTabs.push('right-model');
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
}
