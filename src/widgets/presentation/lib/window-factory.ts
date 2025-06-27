import type { Model, Node } from 'flexlayout-react';
import type { XElement } from 'shared/lib';
import { PresentationLayoutFactory } from './layout-factory';
import { showPresentationWindow } from './window-actions';


export class PresentationWindowFactory {
  /** ID презентации, которой принадлежит окно. */
  private readonly id: ClientID;
  /** Список всех доступных форм презентации. */
  private readonly forms: FormDataWM[];
  /** ID всех форм, которые содержит окно. */
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
    const layout = this.createLayout(element.getChild('layout'));

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

  private createLayout(element: XElement): Model {
    const factory = new PresentationLayoutFactory(this.id, this.forms, null);
    const model = factory.createLayout(element) ?? factory.createDefault();

    model.visitNodes((node: Node) => {
      if (node.getType() === 'tab') this.windowFormIDs.add(node.getId());
    });
    return model;
  }
}
