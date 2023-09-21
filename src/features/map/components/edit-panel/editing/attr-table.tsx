import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setMapField } from '../../../store/map.actions';
import { mapStateSelector } from '../../../store/map.selectors';

import './attr-table.scss';
import { Input } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';


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
  const [attrTable, setAttrTable] = useState({});

  useEffect(() => {
    setOpen(true);
    return () => setOpen(false);
  }, []); // eslint-disable-line

  useEffect(() => {
    setAttrTable({...selectedObject?.attrTable});
  }, [selectedObject]);

  const apply = () => {
    modifiedLayer.modified = true;
    selectedObject.attrTable = attrTable;
    dispatch(setMapField(formID, 'isModified', true));
    onClose();
  };

  const pairToField = ([key, value], i: number) => {
    const onChange = (e) => {
      setReadyForApply(true);
      attrTable[key] = e.value;
      setAttrTable({...attrTable});
    };
    return (
      <div key={i} className={'attr-table-field'}>
        <span>{key}</span>
        <Input value={value} onChange={onChange}/>
      </div>
    );
  };

  return (
    <>
      <div style={{height: 154}}>
        {Object.entries<string>(attrTable).map(pairToField)}
      </div>
      <div className={'wm-dialog-actions'}>
        <Button disabled={!readyForApply} onClick={apply}>
          {t('base.apply')}
        </Button>
        <Button disabled={!readyForApply} onClick={onClose}>
          {t('base.cancel')}
        </Button>
      </div>
    </>
  );
};
