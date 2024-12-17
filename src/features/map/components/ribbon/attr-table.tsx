import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setMapEditState } from '../../store/map-edit.actions';
import { MapStage } from '../../lib/map-stage';

import './attr-table.scss';
import { Input } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';


interface AttrTableWindowProps {
  id: FormID;
  stage: MapStage;
  element: MapElement;
  onClose: () => void;
}

export const AttrTableWindow = ({id, stage, element, onClose}: AttrTableWindowProps) => {
  const { t } = useTranslation();
  const [init] = useState({...element.attrTable});
  const [signal, setSignal] = useState(false);
  const [changed, setChanged] = useState(false);

  const apply = () => {
    stage.getActiveElementLayer().modified = true;
    setMapEditState(id, {modified: true});
    onClose();
  };
  const cancel = () => {
    element.attrTable = init;
    onClose();
  };

  const pairToField = ([key, value], i: number) => {
    const onChange = (e) => {
      setChanged(true); setSignal(!signal);
      element.attrTable[key] = e.value;
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
        {Object.entries<string>(element.attrTable).map(pairToField)}
      </div>
      <div className={'wm-dialog-actions'}>
        <Button disabled={!changed} onClick={apply}>
          {t('base.apply')}
        </Button>
        <Button onClick={cancel}>
          {t('base.cancel')}
        </Button>
      </div>
    </>
  );
};
