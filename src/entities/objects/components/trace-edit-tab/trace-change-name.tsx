import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setCurrentTrace } from '../../index';
import './traces-edit-tab.scss';


interface TraceChangeNameProps {
  model: TraceModel,
}


export const TraceChangeName = ({model}: TraceChangeNameProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const name = model.name;
  const [newName, setNewName] = useState(name);

  useEffect(()=>{
    setNewName(name);
  }, [name]);

  const onChangeHandler = (event) => {
    setNewName(event.target.value.toString());
  };

  const onBlurHandler = () => {
    dispatch(setCurrentTrace({...model, name: newName}));
  };

  return (
    <div className='trace-edit-tab__inner-block'>
      <div className='menu-header trace-edit-tab__title-text'>
        {t('trace.change-name-title')}
      </div>
      <input
        type={'text'} style={{fontSize: '12px'}}
        className={'change-name k-input k-input-md k-rounded-md k-input-solid'}
        value={newName} onChange={onChangeHandler} onBlur={onBlurHandler}
      />
    </div>
  );
};
