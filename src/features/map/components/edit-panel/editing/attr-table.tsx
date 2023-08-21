import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Label } from '@progress/kendo-react-labels';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';

import { toPairs } from 'lodash';
import { setMapField } from '../../../store/map.actions';
import { mapStateSelector } from '../../../store/map.selectors';


interface AttrTableWindowProps {
  formID: FormID;
  setOpen;
  onClose: () => void;
}


export const AttrTableWindow = ({formID, setOpen, onClose}: AttrTableWindowProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const mapState: MapState = useSelector(mapStateSelector.bind(formID));
  const selectedObject = mapState.element;
  const modifiedLayer = mapState.mapData?.layers?.find(l => l.elements?.includes(selectedObject));

  const [readyForApply, setReadyForApply] = useState(false);
  const [attrTable, setAttrTable] = useState(null);

  useEffect(() => {
    setOpen(true);
    return () => setOpen(false);
  }, []); // eslint-disable-line

  useEffect(() => {
    setAttrTable({ ...selectedObject?.attrTable });
  }, [selectedObject]);

  const apply = () => {
    modifiedLayer.modified = true;
    selectedObject.attrTable = attrTable;
    dispatch(setMapField(formID, 'isModified', true));
    onClose();
  };

  return (
    <>
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
      <Button disabled={!readyForApply} onClick={onClose}>
        {t('base.cancel')}
      </Button>
    </>
  );
}
