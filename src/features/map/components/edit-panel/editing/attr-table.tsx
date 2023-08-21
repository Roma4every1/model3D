import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Label } from '@progress/kendo-react-labels';
import { Button } from '@progress/kendo-react-buttons';
import { Window } from '@progress/kendo-react-dialogs';
import { Input } from '@progress/kendo-react-inputs';

import { toPairs } from 'lodash';
import { setOpenedWindow } from 'entities/window';
import { setMapField } from '../../../store/map.actions';
import { mapStateSelector } from '../../../store/map.selectors';


interface AttrTableWindowProps {
  formID: FormID,
  setAttrTableOpen,
}


const windowsSelector = (state: WState) => state.windowData.windows;

export const AttrTableWindow = ({formID, setAttrTableOpen}: AttrTableWindowProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const windows = useSelector(windowsSelector);
  const mapState : MapState = useSelector(mapStateSelector.bind(formID));
  const selectedObject = mapState.element;
  const modifiedLayer = mapState.mapData?.layers?.find(l => l.elements?.includes(selectedObject));

  const [readyForApply, setReadyForApply] = useState(false);
  const [attrTable, setAttrTable] = useState(null);

  const windowRef = useRef(null);

  useEffect(() => {
    setAttrTableOpen(true);
    return () => setAttrTableOpen(false);
  }, []); // eslint-disable-line

  useEffect(() => {
    setAttrTable({ ...selectedObject?.attrTable });
  }, [selectedObject]);

  const close = () => {
    let position;
    if (windowRef.current) position = {top: windowRef.current.top, left: windowRef.current.left};
    dispatch(setOpenedWindow('mapAttrTableWindow', false, null, position));
  };

  const apply = () => {
    modifiedLayer.modified = true;
    selectedObject.attrTable = attrTable;
    dispatch(setMapField(formID, 'isModified', true));
    close();
  };

  return (
    <Window
      ref={windowRef}
      title={t('map.attr-table')}
      onClose={close}
      initialLeft={windows['mapAttrTableWindow']?.position?.left}
      initialTop={windows['mapAttrTableWindow']?.position?.top}
      width={300}
      height={300}
    >
      {toPairs<any>(attrTable).map(value => {
          return (
            <div className={'attrTableBlock'}>
              <Label className={'attrTableLabel'}>
                  {value[0]}
              </Label>
              <Input
                className={'attrTableEditor'}
                value={value[1]}
                name={value[0]}
                onChange={(event) => {
                  setReadyForApply(true);
                  attrTable[value[0]] = event.value;
                  setAttrTable({ ...attrTable });
                }}
              />
            </div>
          );
      })}
      <Button disabled={!readyForApply} onClick={apply}>
        {t('base.apply')}
      </Button>
      <Button disabled={!readyForApply} onClick={close}>
        {t('base.cancel')}
      </Button>
    </Window>
  );
}
