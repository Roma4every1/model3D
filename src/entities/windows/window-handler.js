import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { GridLayout, GridLayoutItem } from '@progress/kendo-react-layout';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { saveAs } from '@progress/kendo-file-saver';
import { windowsSelector, messageWindowSelector } from './store/window-data.selectors';
import { closeWindow } from './store/window-data.actions';


export const WindowHandler = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const windowData = useSelector(messageWindowSelector);
  const windows = useSelector(windowsSelector);

  const [stackTraceVisible, setStackTraceVisible] = useState(false);

  const handleStackTrace = () => { setStackTraceVisible(!stackTraceVisible); };
  const handleClose = () => { dispatch(closeWindow()); };

  const handleSave = () => {
    const blobOptions = {type: 'text/plain;charset=utf-8'};
    const blob = new Blob([windowData.text.replaceAll('\n', '\r\n')], blobOptions);
    saveAs(blob, windowData.fileToSaveName);
  };

  let typeIcon = 'k-i-x-circle';
  let classButton = '';
  const classIcon = `k-icon ${typeIcon} k-icon-32`;

  if (windowData?.opened) switch (windowData.type) {
    case 'error': { typeIcon = 'k-i-x-circle'; classButton = 'colored-red'; break; }
    case 'warning': { typeIcon = 'k-i-warning'; classButton = 'colored-red'; break; }
    case 'info': { typeIcon = 'k-i-info'; classButton = 'colored-blue'; break; }
    default: { typeIcon = 'k-i-x-circle'; classButton = 'colored-red'; break; }
  }

  return (
    <div>
      {windows ? Object.values(windows).filter(w => w.visible).map(w => w.window) : <div/>}
      {windowData?.opened && <Dialog title={windowData.header} onClose={handleClose}>
        <div className={'grid-layout-container-' + stackTraceVisible} >
          <GridLayout gap={{rows: 2, cols: 2,}}>
            <GridLayoutItem row={1} col={1} rowSpan={2} className={'horizontal'}>
              <div className={classButton} style={{margin: 5}} onClick={handleStackTrace}>
                <span className={'cursor-pointer ' + classIcon}/>
              </div>
            </GridLayoutItem>
            <GridLayoutItem row={1} col={2}>
              <div className={'windowhandler-text'}>{windowData.text}</div>
            </GridLayoutItem>
            {stackTraceVisible && <GridLayoutItem row={2} col={2}>
              <div className={'windowhandler-stacktrace'}>{windowData.stackTrace}</div>
            </GridLayoutItem>}
          </GridLayout>
        </div>
        <DialogActionsBar>
          <div className={'windowButtonContainer'}>
            <Button className='windowButton' onClick={handleClose}>{t('base.ok')}</Button>
          </div>
          {windowData.fileToSaveName && <div className={'windowButtonContainer'}>
            <Button className={'windowButton'} onClick={handleSave}>{t('base.save')}</Button>
          </div>}
        </DialogActionsBar>
      </Dialog>}
    </div>
  );
};
