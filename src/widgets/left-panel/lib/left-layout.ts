import { Model, Actions, DockLocation } from 'flexlayout-react';


/** Информация о вкладке. */
export interface LeftTabInfo {
  /** ID вкладки. */
  id: string;
  /** Название вкладки. */
  displayName: string;
  /** Показывать ли вкладку. */
  show: boolean;
  /** ID родителя. */
  parent?: string;
  /** Индекс вкладки в группе. */
  index?: number;
  /** Запрещено ли менять видимость вкладки. */
  disabled?: boolean;
}

/** Контроллер разметки левой панели. */
export class LeftLayoutController implements ILeftLayoutController {
  /** Модель разметки. */
  public readonly model: Model;
  /** Вкладка глобальных параметров. */
  public readonly globalParameters: LeftTabInfo;
  /** Вкладка параметров презентации. */
  public readonly presentationParameters: LeftTabInfo;
  /** Вкладка дерева презентаций. */
  public readonly presentationTree: LeftTabInfo;

  constructor(model: Model, gp: LeftTabInfo, pp: LeftTabInfo, tree: LeftTabInfo) {
    this.model = model;
    this.globalParameters = gp;
    this.presentationParameters = pp;
    this.presentationTree = tree;
  }

  /** Вернёт видимость вкладки в левой панели. */
  public showTab(id: LeftTabID): void {
    const info = this[id];
    const tab = {type: 'tab', id: info.id, name: info.displayName, component: id};
    const tabSet = info.parent ? this.model.getNodeById(info.parent) : null;

    const action = tabSet
      ? Actions.addNode(tab, info.parent, DockLocation.CENTER, info.index, false)
      : Actions.addNode(tab, 'left-root', DockLocation.BOTTOM, 0, false);

    this.model.doAction(action);
    info.show = true;
  }

  /** Скроет видимость вкладки в левой панели. */
  public hideTab(tab: LeftTabID): void {
    const info = this[tab];
    const id = info.id;
    const parent = this.model.getNodeById(id)?.getParent();
    const children = parent?.getChildren();

    info.show = false;
    info.parent = parent?.getId();
    info.index = children ? children.findIndex(item => item.getId() === id) : -1;
    this.model.doAction(Actions.deleteTab(id));
  }
}
