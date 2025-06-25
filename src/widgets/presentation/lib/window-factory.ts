import type { IJsonTabSetNode, IJsonTabNode } from 'flexlayout-react';
import { Model } from 'flexlayout-react';
import { XElement } from 'shared/lib';
import { showPresentationWindow } from './window-actions';
import { globalAttributes } from './layout-factory';


export class PresentationWindowFactory {
  private readonly id: ClientID;
  private readonly forms: FormDataWM[];
  private windowFormIDs: Set<FormID>;

  constructor(id: ClientID, forms: FormDataWM[]) {
    this.id = id;
    this.forms = forms;
  }

  public create(extra: XElement): Record<string, PresentationWindow> {
    const windows: Record<string, PresentationWindow> = {};
    for (const element of extra.getChildren('window')) {
      const window = this.createWindow(element);
      if (window) windows[window.name] = window;
    }
    return windows;
  }

  private createWindow(element: XElement): PresentationWindow {
    const name = element.getAttribute('name');
    if (!name) return null;

    this.windowFormIDs = new Set();
    const layout = this.createWindowLayout(element.getChild('layout'));
    if (!layout) return null;

    const id = this.id;
    const open = (initiator?: ClientID) => showPresentationWindow(id, name, initiator);

    const settings = this.createWindowSettings(element);
    return {name, formIDs: this.windowFormIDs, settings, layout, open};
  }

  private createWindowSettings(element: XElement): PresentationWindowSettings {
    const getSize = (name: string): string | undefined => {
      const size = element.getAttribute(name);
      return /^\d+(?:px|%)?$/.test(size) ? size : undefined;
    };
    const width = getSize('width');
    const minWidth = getSize('minWidth');
    const height = getSize('height');
    const minHeight = getSize('minHeight');

    const title = element.getAttribute('title');
    const resizable = element.getBooleanAttribute('resizable') ?? true;
    return {title, width, minWidth, height, minHeight, resizable};
  }

  private createWindowLayout(element: XElement): Model {
    const root = element?.getChild('row');
    const elements = root?.getChildren('client');
    if (!elements) return;

    let children = elements.map((e: XElement): IJsonTabSetNode => {
      const name = e.getAttribute('name');
      if (!name) return;

      const form = this.forms.find(f => f.id.endsWith(name));
      if (!form) return;
      this.windowFormIDs.add(form.id);

      const weight = e.getNumberAttribute('weight');
      const child: IJsonTabNode = {type: 'tab', id: form.id, name: form.displayName, config: form};
      return {type: 'tabset', weight, children: [child]};
    });

    children = children.filter(Boolean);
    if (children.length === 0) return;

    const vertical = root.getAttribute('orientation') === 'vertical';
    const global = {...globalAttributes, rootOrientationVertical: vertical};
    return Model.fromJson({global, layout: {type: 'row', children}});
  }
}
