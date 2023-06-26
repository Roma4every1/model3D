import {setTraceName} from "../../store/traces.actions";
import {useDispatch} from "react-redux";
import './traces-edit-tab.scss'
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";

interface TraceChangeNameProps {
  name: string | null;
}

export const TraceChangeName = ({name}: TraceChangeNameProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [newName, setNewName] = useState(name)

  // обработка случая изменения трассы в параметрах при активном режиме редактирования
  useEffect(()=>{
    setNewName(name);
  }, [name])

  // изменение имени трассы
  const onChangeHandler = (event) => {
    setNewName(event.target.value.toString());
  }

  const onBlurHandler = () => {
    dispatch(setTraceName(newName));
  }

  return (
    <div className='trace-edit-tab__inner-block'>
      <div className='menu-header trace-edit-tab__title-text'>
        {t('trace.change-name-title')}
      </div>
      <input className="change-name k-input k-input-md k-rounded-md k-input-solid"
             style={{fontSize: '12px'}}
             type="text"
             value={newName}
             onChange={onChangeHandler}
             onBlur={onBlurHandler}
      />
    </div>
  )
}
