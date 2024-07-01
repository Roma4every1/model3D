/** Выражение параметра: вызов какого-либо метода.
 * @example
 * 'date.Year' => {name: 'date', method: 'Year'}
 * 'row.Cell[ID]' => {name: 'row', method: 'Cell', argument: 'ID'}
 */
interface ParameterExpression {
  /** Идентификатор параметра. */
  id: ParameterID;
  /** Название параметра. */
  name: ParameterName;
  /** Вызываемый метод. */
  method: string;
  /** Аргумент метода. */
  argument?: string;
  /** Значение по умолчанию. */
  defaultValue?: string;
}

/** Узел шаблона: строка или выражение для подстановки. */
type TemplateNode = string | ParameterExpression[];


/**
 * Класс, описывающий шаблон строки на основе параметров системы.
 *
 * @example
 * const pt = new ParameterTemplate('year is $(date.Year:2024)');
 * const date = {id: 'date', type: 'date', value: new Date('2025')};
 * pt.build({date}) => 'year is 2025'
 */
export class ParameterStringTemplate {
  /** Исходный текст шаблона. */
  public readonly source: string;
  /** Идентификаторы параметров системы для подстановки. */
  public readonly parameterIDs: Set<ParameterID>;
  /** Узлы шаблона. */
  private readonly nodes: TemplateNode[];

  constructor(source: string, resolve: PNameResolve) {
    this.source = source;
    this.parameterIDs = new Set();
    this.nodes = this.parse(source, resolve);
  }

  public build(values?: Parameter[]): string | null {
    if (this.parameterIDs.size === 0) return this.source;
    if (!values) values = [];
    return this.nodes.map(node => this.buildNode(node, values)).join('');
  }

  private buildNode(node: TemplateNode, values: Parameter[]): string {
    if (typeof node === 'string') return node;
    for (const { id, method, argument } of node) {
      const parameter = values.find(p => p.id === id);
      if (!parameter || !parameter[method]) continue;
      const value = parameter[method](argument);
      if (value !== null) return value;
    }
    return node.at(-1).defaultValue ?? '';
  }

  /* --- Parsing --- */

  private parse(source: string, resolve: PNameResolve): TemplateNode[] {
    if (!source) return [];
    const positions: number[] = [];
    let deep = 0;
    let startPosition = 0;

    for (const match of source.matchAll(/\$\(|\)/g)) {
      const value = match[0];
      const position = match.index;

      if (value === ')') {
        if (deep === 0) continue;
        deep -= 1;
        if (deep === 0) positions.push(startPosition, position + 1);
      } else { // '$('
        if (deep === 0) startPosition = position;
        deep += 1;
      }
    }

    if (positions.length === 0) return [this.source];
    const nodes: TemplateNode[] = [];
    let nodePosition = 0;

    for (let i = 0; i < positions.length; i += 2) {
      const start = positions[i];
      const end = positions[i + 1];

      const expressionSource = source.substring(start, end);
      const expressions = parseParameterExpression(expressionSource);
      if (!expressions) continue;

      if (start >= nodePosition) {
        if (start > nodePosition) nodes.push(source.substring(nodePosition, start));
        nodePosition = end;
      }
      nodes.push(expressions);

      for (const expression of expressions) {
        const id = resolve(expression.name);
        expression.id = id;
        this.parameterIDs.add(id);
      }
    }

    const postfix = source.substring(nodePosition);
    if (postfix) nodes.push(postfix);
    return nodes;
  }
}

/**
 * @example
 * '$(date.Year)' => [{id: 'date', method: 'Year'}]
 * '$(row.Cell[ID]:0)' => [{id: 'row', method: 'Cell', argument: 'ID', defaultValue: '0'}]
 */
function parseParameterExpression(source: string): ParameterExpression[] | null {
  let defaultValue: string;
  const nodes: ParameterExpression[] = [];

  while (true) {
    if (!source) break;
    const match = source.match(/^\$\((\w+)(?:\.(\w+)(?:\[(\w+)])?)?(?::(.*))?\)$/);
    if (!match) { defaultValue = source; break; }

    const [, name, method, argument, defaultNodeValue] = match;
    source = defaultNodeValue;

    const node: ParameterExpression = {id: undefined, name, method: method ?? 'Value'};
    if (argument) node.argument = argument;
    nodes.push(node);
  }

  if (nodes.length === 0) return null;
  if (defaultValue) nodes[nodes.length - 1].defaultValue = defaultValue;
  return nodes;
}
