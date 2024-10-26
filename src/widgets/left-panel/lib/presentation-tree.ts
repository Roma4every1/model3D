import { hasIntersection } from 'shared/lib';
import { ParameterStringTemplate } from 'entities/parameter';


/** DTO дерева презентаций. */
export type PresentationTreeDTO = PresentationTreeGroupDTO[];

/** DTO группы презентаций. */
interface PresentationTreeGroupDTO {
  /** Подпись группы. */
  readonly text: string;
  /** Элементы группы. */
  readonly items: PresentationTreeLeafDTO[];
}

/** Лист DTO дерева презентаций. */
interface PresentationTreeLeafDTO {
  /** Идентификатор клиента. */
  readonly id: string;
  /** Подпись презентации. */
  readonly text: string;
  /** Шаблон видимости элемента в дереве. */
  readonly visibilityString?: string | null;
}

/** Элемент дерева презентаций. */
export interface PresentationTreeNode {
  /** ID узла; для листьев равен ID презентации, для группы число. */
  key: ClientID | number;
  /** Название группы или презентации. */
  title: string;
  /** Дочерние элементы. */
  children?: PresentationTreeNode[];
}

interface InternalGroupNode {
  readonly key: number;
  readonly title: string;
  visible: boolean;
  children: InternalLeafNode[];
}
interface InternalLeafNode {
  readonly key: ClientID;
  readonly title: string;
  visible: boolean;
  visibilityTemplate?: ParameterStringTemplate;
}


/** Обёртка для дерева презентаций. */
export class PresentationTree {
  /** Узлы верхнего уровня. */
  public topNodes: PresentationTreeNode[];
  /** ID раскрытых узлов. */
  public expandedKeys: number[];
  /** ID выделенных узлов (всегда один). */
  public selectedKeys: ClientID[];

  /** Внутреннее представление дерева. */
  private readonly internalTree: InternalGroupNode[];

  constructor(dto: PresentationTreeDTO, activeID: ClientID, pResolve: PNameResolve) {
    this.topNodes = [];
    this.expandedKeys = [];
    this.selectedKeys = [];
    let i = 0;

    const createLeaf = (item: PresentationTreeLeafDTO): InternalLeafNode => {
      const { id, text: title, visibilityString: pattern } = item;
      const node: InternalLeafNode = {key: id, title, visible: true};
      if (pattern) node.visibilityTemplate = new ParameterStringTemplate(pattern, pResolve);
      return node;
    };
    const createGroup = ({text, items}: PresentationTreeGroupDTO): InternalGroupNode => {
      const children = items.map(createLeaf);
      const activeIndex = children.findIndex(c => c.key === activeID);
      const key = ++i;

      if (activeIndex !== -1) {
        this.expandedKeys.push(key);
        this.selectedKeys.push(children[activeIndex].key);
      }
      return {key, title: text, visible: true, children};
    };
    this.internalTree = dto.map(createGroup);
  }

  public updateVisibility(parameters: Parameter[], changes?: Set<ParameterID>): boolean {
    let changed = false;
    for (const groupNode of this.internalTree) {
      groupNode.visible = false;
      for (const node of groupNode.children) {
        const template = node.visibilityTemplate;
        if (template && (!changes || hasIntersection(changes, template.parameterIDs))) {
          const oldVisible = node.visible;
          this.calcVisibility(node, parameters);
          if (oldVisible !== node.visible) changed = true;
        }
        if (node.visible) groupNode.visible = true;
      }
    }
    return changed;
  }

  public updateNodes(): void {
    this.topNodes = [];
    for (const groupNode of this.internalTree) {
      if (!groupNode.visible) continue;
      const children: PresentationTreeNode[] = [];

      for (const child of groupNode.children) {
        if (!child.visible) continue;
        children.push({key: child.key, title: child.title});
      }
      this.topNodes.push({key: groupNode.key, title: groupNode.title, children});
    }
  }

  private calcVisibility(node: InternalLeafNode, parameters: Parameter[]): void {
    try {
      const expression = node.visibilityTemplate.build(parameters);
      node.visible = Boolean(eval(expression));
    } catch {
      node.visible = false;
    }
  }
}
