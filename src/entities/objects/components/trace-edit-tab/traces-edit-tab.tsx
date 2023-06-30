import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { traceStateSelector, setCurrentTrace } from '../../index';

import './traces-edit-tab.scss';
import { TraceChangeName } from './trace-change-name';
import { TracePointsList } from './trace-points-list';
import { TraceAddPoint } from './trace-add-point';


/** Правая панель редактирования трассы. */
export const TracesEditTab = ({formID}: PropsFormID) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { model, oldModel } = useSelector(traceStateSelector);
  if (!model) return <div/>;

  const onClick = () => {
    dispatch(setCurrentTrace(oldModel, undefined, false));
  };

  return (
    <section className='trace-edit-tab'>
      <div className='trace-edit-tab__header'>
        <div className='title'>
          <div>{t('trace.edit-panel')}</div>
        </div>
        <span className='k-clear-value'>
        <span className={'k-icon k-i-close'} onClick={onClick}/>
      </span>
      </div>
      <div className='trace-edit-tab__body'>
        <TraceChangeName model={model}/>
        <TracePointsList model={model}/>
        <TraceAddPoint formID={formID} model={model}/>
      </div>
    </section>
  );
};
