export interface XRawElement {
  /** Название элемента. */
  name: string;
  /** Атрибуты элемента. */
  attrs?: XAttributes;
  /** Дочерние элементы либо текст. */
  children?: XRawElement[] | string;
}
/** Коллекция атрибутов XML-элемента. */
export type XAttributes = Record<string, string>;

/** Класс-обёртка для работы с XML-элементом */
export class XElement {
  private readonly name: string;
  private readonly attrs: XAttributes;
  private readonly children: XRawElement[];
  private readonly text: string | undefined;

  public static create(raw: XRawElement): XElement {
    return new XElement(raw.name, raw.attrs, raw.children);
  }

  public static tryCreate(raw: XRawElement): XElement | null {
    if (!raw || !raw.name) return null;
    try {
      return new XElement(raw.name, raw.attrs, raw.children);
    } catch {
      return null;
    }
  }

  constructor(name: string, attrs?: XAttributes, content?: XRawElement[] | string) {
    this.name = name;
    this.attrs = attrs ?? {};

    if (Array.isArray(content)) {
      this.children = content;
    } else {
      this.children = [];
      if (content) this.text = content;
    }
  }

  public getName(): string {
    return this.name;
  }

  /* --- Attributes --- */

  public getAttribute(name: string): string | undefined {
    return this.attrs[name];
  }

  public getIntAttribute(name: string): number | null | undefined {
    const value = this.attrs[name];
    if (value === undefined) return;
    const nValue = Number.parseInt(value);
    return Number.isNaN(nValue) ? null : nValue;
  }

  public getNumberAttribute(name: string): number | null | undefined {
    const value = this.attrs[name];
    if (value === undefined) return;
    const nValue = Number.parseFloat(value);
    return Number.isNaN(nValue) ? null : nValue;
  }

  public getBooleanAttribute(name: string): boolean | undefined {
    const value = this.attrs[name];
    if (value !== undefined) return value === 'true' || value === '1';
  }

  public getAttributes(): XAttributes {
    return this.attrs;
  }

  /* --- Children --- */

  public getChild(n: number | string = 0): XElement | undefined {
    if (typeof n === 'number') {
      const rawNode = this.children[n];
      if (rawNode) return XElement.create(rawNode);
    } else {
      const rawNode = this.children.find(c => c.name === n);
      if (rawNode) return XElement.create(rawNode);
    }
  }

  public getChildren(m?: StringMatcher): XElement[] {
    let children: XRawElement[] = this.children;
    if (typeof m === 'string') {
      children = children.filter(c => c.name === m);
    } else if (Array.isArray(m)) {
      children = children.filter(c => m.includes(c.name));
    } else if (m) {
      children = children.filter(c => m.test(c.name));
    }
    return children.map(XElement.create);
  }

  public getChildCount(): number {
    return this.children.length;
  }

  public getChildThrough(...names: string[]): XElement | undefined {
    let node: XRawElement;
    let children: XRawElement[] = this.children;

    for (const name of names) {
      node = children.find(c => c.name === name);
      if (!Array.isArray(node?.children)) return undefined;
      children = node.children;
    }
    return XElement.create(node);
  }

  public getChildrenThrough(...names: string[]): XElement[] {
    let node: XRawElement;
    let children: XRawElement[] = this.children;

    const last = names.pop();
    for (const name of names) {
      node = children.find(c => c.name === name);
      if (!Array.isArray(node?.children)) return [];
      children = node.children;
    }
    return children.filter(c => c.name === last).map(XElement.create);
  }

  public getText(): string | undefined {
    return this.text;
  }
}
