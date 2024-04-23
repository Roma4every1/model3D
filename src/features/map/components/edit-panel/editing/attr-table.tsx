import { useState} from 'react';
import { useTranslation } from 'react-i18next';
import { setMapField } from '../../../store/map.actions';

import './attr-table.scss';
import { Input } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';


interface AttrTableWindowProps {
  id: FormID;
  stage: IMapStage;
  onClose: () => void;
}


export const AttrTableWindow = ({id, stage, onClose}: AttrTableWindowProps) => {
  const { t } = useTranslation();
  const activeElement = stage.getActiveElement();
  const [init] = useState({...activeElement.attrTable});

  const [signal, setSignal] = useState(false);
  const [changed, setChanged] = useState(false);

  const apply = () => {
    stage.getActiveElementLayer().modified = true;
    setMapField(id, 'modified', true);
    onClose();
  };
  const cancel = () => {
    activeElement.attrTable = init;
    onClose();
  };

  const pairToField = ([key, value], i: number) => {
    const onChange = (e) => {
      setChanged(true); setSignal(!signal);
      activeElement.attrTable[key] = e.value;
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
        {Object.entries<string>(activeElement.attrTable).map(pairToField)}
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
