import { Model, Actions, TabSetNode, TabNode, Node } from 'flexlayout-react';


/** Рассчитывает состояние форм в презентации при текущей разметке. */
export function calcClientChildren(layout: Model): ClientChildren {
  const handler = new PresentationLayoutHandler();
  return handler.handle(layout);
}

class PresentationLayoutHandler {
  /** Список форм в презентации, которые должны быть обновляться при текущей разметке. */
  private opened: Set<ClientID> = new Set();
  /** Типы форм, которые видны при текущей разметке. */
  private types: Set<ClientType> = new Set();

  /** Находится ли элемент внутри вложенной разметки. */
  private isNestedLayout: boolean = false;
  /** Находится ли элемент внутри активной вложенной разметки. */
  private isActiveNestedLayout: boolean = false;

  /** Груупа вкладок, в которой находится активная. */
  private activeTabSet: TabSetNode;
  /** Вкладка основной разметки, в которой находится активная вложенная. */
  private activeModelTab: TabNode;

  public handle(layout: Model): ClientChildren {
    this.handleNode(layout.getRoot());
    const activeChildID = this.resolveActiveID(layout);
    return {openedChildren: this.opened, childrenTypes: this.types, activeChildID};
  }

  private handleNode(node: Node): void {
    if (node.getType() === 'row') {
      node.getChildren().forEach(c => this.handleNode(c));
    } else {
      this.handleTabSet(node as TabSetNode);
    }
  }

  private handleTabSet(node: TabSetNode): void {
    if (node.isActive()) this.activeTabSet = node;
    const children = node.getChildren() as TabNode[];
    const selected = node.getSelected();
    children.forEach((t: TabNode, i: number) => this.handleTab(t, i === selected));
  }

  private handleTab(child: TabNode, active: boolean): void {
    if (child.getComponent() === 'layout') {
      this.isNestedLayout = true;
      if (active) {
        this.activeModelTab = child;
        this.isActiveNestedLayout = true;
      }
      this.handleNode(child.getConfig().getRoot());
      this.isNestedLayout = false;
      this.isActiveNestedLayout = false;
    }
    else if (!this.isNestedLayout || this.isActiveNestedLayout) {
      this.types.add(child.getConfig().type);
      if (active) this.opened.add(child.getId());
    }
  }

  private resolveActiveID(layout: Model): FormID {
    if (this.activeModelTab && !layout.getActiveTabset()) {
      layout.doAction(Actions.selectTab(this.activeModelTab.getId()));
    }
    return this.activeTabSet?.getChildren()[this.activeTabSet.getSelected()]?.getId() ?? null;
  }
}
