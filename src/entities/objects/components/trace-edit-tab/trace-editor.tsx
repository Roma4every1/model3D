import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { traceStateSelector, setCurrentTrace } from '../../index';

import './traces-edit-tab.scss';
import { TraceChangeName } from './trace-change-name';
import { TraceNodes } from './trace-nodes';
import { TraceAddNode } from './trace-add-node';


/** Правая панель редактирования трассы. */
export const TraceEditor = ({formID}: PropsFormID) => {
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
        <TraceNodes model={model}/>
        <TraceAddNode model={model} formID={formID}/>
      </div>
    </section>
  );
};
