import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { GridLayout, GridLayoutItem } from "@progress/kendo-react-layout";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Button } from "@progress/kendo-react-buttons";
import { saveAs } from '@progress/kendo-file-saver';
import { Notification, NotificationGroup } from "@progress/kendo-react-notification";
import { actions } from "../../store";


export default function WindowHandler() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [stackTraceVisible, setStackTraceVisible] = React.useState(false);

    const handleStackTrace = () => {
        setStackTraceVisible(!stackTraceVisible);
    };

    const handleClose = () => {
        dispatch(actions.closeWindow());
    };

    const handleSave = () => {
        const blob = new Blob([windowData.text.replaceAll('\n', '\r\n')], {type: "text/plain;charset=utf-8"});
        saveAs(blob, windowData.fileToSaveName);
    };

    const windowData = useSelector((state) => state.windowData?.messageWindow);
    const windows = useSelector((state) => state.windowData?.windows);
    const WindowNotification = useSelector((state) => state.windowData?.Notification);

    let typeIcon = 'k-i-x-circle';
    let classButton = '';

    if (windowData?.opened) {
        switch (windowData.type) {
            case 'error':
                typeIcon = "k-i-x-circle";
                classButton = "colored-red";
                break;
            case 'warning':
                typeIcon = "k-i-warning";
                classButton = "colored-red";
                break;
            case 'info':
                typeIcon = "k-i-info";
                classButton = "colored-blue";
                break;
            default:
                typeIcon = "k-i-x-circle";
                classButton = "colored-red";
                break;
        }
    }

    const classIcon = `k-icon ${typeIcon} k-icon-32`;

    return (
      <div>
          {windows ? Object.values(windows).filter(w => w.visible).map(w => w.window) : <div/>}
          {windowData?.opened && <Dialog title={windowData.header} onClose={handleClose}>
              <div className={"grid-layout-container-" + stackTraceVisible} >
                  <GridLayout gap={{rows: 2, cols: 2,}}>
                      <GridLayoutItem row={1} col={1} rowSpan={2} className="horizontal">
                          <div className={"margin-5 " + classButton} onClick={handleStackTrace}>
                              <span className={"cursor-pointer " + classIcon} onClick={handleStackTrace} />
                          </div>
                      </GridLayoutItem>
                      <GridLayoutItem row={1} col={2}>
                          <div className="windowhandler-text">
                              {windowData.text}
                          </div>
                      </GridLayoutItem>
                      {stackTraceVisible && <GridLayoutItem row={2} col={2}>
                          <div className="windowhandler-stacktrace">
                              {windowData.stackTrace}
                          </div>
                      </GridLayoutItem>}
                  </GridLayout>
              </div>
              <DialogActionsBar>
                  <div className="windowButtonContainer">
                      <Button className="windowButton" onClick={handleClose}>
                          {t('base.ok')}
                      </Button>
                  </div>
                  {windowData.fileToSaveName && <div className="windowButtonContainer">
                      <Button className="windowButton" onClick={handleSave}>
                          {t('base.save')}
                      </Button>
                  </div>}
              </DialogActionsBar>
          </Dialog>}
          {WindowNotification?.opened && <NotificationGroup style = {{width: 250, right: 0, bottom: 0, zIndex: 30, position: 'fixed'}}>
              <Notification type = {{style: 'info', icon: true}}>
                  <span>{WindowNotification.text}</span>
              </Notification>
          </NotificationGroup>}
      </div>
    );
}