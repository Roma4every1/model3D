import { ParameterExpression } from './parameter.types';
import { parseParameterExpression } from './utils';


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

  constructor(source: string) {
    this.source = source;
    this.parameterIDs = new Set();
    this.nodes = this.parse(source);
  }

  public build(values?: Record<string, Parameter>): string | null {
    if (this.parameterIDs.size === 0) return this.source;
    if (!values) values = {};
    return this.nodes.map(node => this.buildNode(node, values)).join('');
  }

  private buildNode(node: TemplateNode, values: Record<string, Parameter>): string {
    if (typeof node === 'string') return node;
    for (const { id, method, argument } of node) {
      const parameter = values[id];
      if (!parameter || !parameter[method]) continue;
      const value = parameter[method](argument);
      if (value !== null) return value;
    }
    return node.at(-1).defaultValue ?? '';
  }

  /* --- Parsing --- */

  private parse(source: string): TemplateNode[] {
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
      const expression = parseParameterExpression(expressionSource);
      if (!expression) continue;

      if (start >= nodePosition) {
        if (start > nodePosition) nodes.push(source.substring(nodePosition, start));
        nodePosition = end;
      }
      nodes.push(expression);
      for (const { id } of expression) this.parameterIDs.add(id);
    }

    const postfix = source.substring(nodePosition);
    if (postfix) nodes.push(postfix);
    return nodes;
  }
}
