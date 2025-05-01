export interface XRawElement {
  /** Специальное свойство, в котором собраны атрибуты. */
  attrs?: XAttributes;
  /** Специальное свойство, в котором задано значение элемента. */
  text?: string;
  /** Все остальные поля определяют дочерние элементы. */
  [key: string]: XChildren /* ; */ | XAttributes | string | undefined;
}
/** Коллекция атрибутов XML-элемента. */
export type XAttributes = Record<string, string>;
/** Дочерние XML-элементы; один или несколько. */
export type XChildren = XRawElement | XRawElement[];

/** Класс-обёртка для работы с XML-элементом */
export class XElement {
  private readonly attributes: XAttributes;
  private readonly children: Record<string, XChildren>;
  private readonly text: string | undefined;

  public static tryCreate(raw: XRawElement): XElement | null {
    if (!raw) return null;
    try {
      return new XElement(raw);
    } catch {
      return null;
    }
  }

  private constructor(raw: XRawElement) {
    const { attrs, text, ...children } = raw;
    this.attributes = attrs ?? {};
    this.text = text ?? undefined;
    this.children = children as Record<string, XChildren>;
  }

  public getAttribute(name: string): string | undefined {
    return this.attributes[name];
  }

  public getNumberAttribute(name: string): number | null | undefined {
    const value = this.attributes[name];
    if (value === undefined) return;
    const nValue = Number.parseFloat(value);
    return Number.isNaN(nValue) ? null : nValue;
  }

  public getBooleanAttribute(name: string): boolean | undefined {
    const value = this.attributes[name];
    if (value !== undefined) return value === 'true' || value === '1';
  }

  public getAttributes(): XAttributes {
    return this.attributes;
  }

  public getChild(name: string): XElement | undefined {
    const value = this.children[name];
    const child = Array.isArray(value) ? value[0] : value;
    return child ? new XElement(child) : undefined;
  }

  public getChildThrough(...names: string[]): XElement | undefined {
    let value: XChildren = this.children[names.shift()];
    let node: XRawElement = Array.isArray(value) ? value[0] : value;
    if (!node) return undefined;

    for (const name of names) {
      value = node[name] as XChildren;
      node = Array.isArray(value) ? value[0] : value;
      if (!node) return undefined;
    }
    return new XElement(node);
  }

  public getChildren(name: string): XElement[] {
    const value = this.children[name];
    const children = Array.isArray(value) ? value : [value];
    return children.map(c => new XElement(c));
  }

  public getText(): string | undefined {
    return this.text;
  }
}
