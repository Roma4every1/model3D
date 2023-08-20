import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { GridLayout, GridLayoutItem } from '@progress/kendo-react-layout';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { windowDataSelector } from './store/window-data.selectors';
import { closeMessageWindow } from './store/window-data.actions';


export const WindowHandler = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { windows, messageWindow: message } = useSelector(windowDataSelector);
  const handleClose = () => dispatch(closeMessageWindow());

  return (
    <div>
      {windows ? Object.values(windows).filter(w => w.visible).map(w => w.window) : <div/>}
      {message?.opened && <Dialog title={message.header} onClose={handleClose} width={400}>
        <GridLayout gap={{rows: 2, cols: 2,}}>
          <GridLayoutItem row={1} col={1} rowSpan={2} className={'horizontal'}>
            <div style={{margin: 5}}>
              <span className={'cursor-pointer k-icon k-i-x-circle k-icon-32'}/>
            </div>
          </GridLayoutItem>
          <GridLayoutItem row={1} col={2}>
            <div className={'windowhandler-text'}>{message.text}</div>
          </GridLayoutItem>
        </GridLayout>
        <DialogActionsBar>
          <Button onClick={handleClose}>{t('base.ok')}</Button>
        </DialogActionsBar>
      </Dialog>}
    </div>
  );
};
