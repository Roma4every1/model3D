import type { WindowProps } from '@progress/kendo-react-dialogs';
import { t } from 'shared/locales';
import { createElement } from 'react';
import { showWindow, closeWindow } from 'entities/window';
import { useObjectsStore } from './objects.store';
import { deleteSelection } from './selection.thunks';
import { SelectionEditor } from '../components/selection-editor/selection-editor';


export function setSelectionState(state: Partial<SelectionState>): void {
  const manager = useObjectsStore.getState().selection;
  manager.state = {...manager.state, ...state};
  useObjectsStore.setState({selection: manager});
}

export function startSelectionCreating(): void {
  const manager = useObjectsStore.getState().selection;
  manager.state = {model: manager.state.model, initModel: null, editing: true};
  useObjectsStore.setState({selection: manager});
  openSelectionEditor();
}

export function startSelectionEditing(): void {
  const manager = useObjectsStore.getState().selection;
  const model = manager.state.model;
  manager.state = {model, initModel: structuredClone(model), editing: true};
  useObjectsStore.setState({selection: manager});
  openSelectionEditor();
}

export function cancelSelectionEditing(): void {
  const manager = useObjectsStore.getState().selection;
  const state = manager.state;

  if (state.initModel) {
    manager.state = {model: state.initModel, initModel: null, editing: false};
  } else {
    deleteSelection().then();
  }
  useObjectsStore.setState({selection: manager});
}

export function openSelectionEditor(): void {
  const windowID = 'selection-editor';
  const manager = useObjectsStore.getState().selection;

  const close = () => closeWindow(windowID);
  const onClose = () => { closeWindow(windowID); cancelSelectionEditing(); };

  const windowProps: WindowProps = {
    width: 400, height: 390, resizable: false,
    className: 'selection-editor', title: t('selection.editor-title'),
    maximizeButton: () => null, onClose,
  };
  showWindow(windowID, windowProps, createElement(SelectionEditor, {manager, close}));
}
