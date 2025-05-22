import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { type StepProps, Steps } from 'antd';
import { LoadingOutlined, LeftCircleOutlined } from '@ant-design/icons';
import { useAppLocation } from '../store/app.store';
import './loading-status.scss';


export const AppLoadingStatus = ({step, error}: AppLoadingState) => {
  let current = 0;
  if (step === 'session') {
    current = 1;
  } else if (step === 'data') {
    current = 2;
  }
  const steps: StepProps[] = [
    {title: 'Инициализация'},
    {title: 'Создание сессии'},
    {title: 'Загрузка данных'}
  ];

  for (let i = 0; i < current; ++i) steps[i].status = 'finish';
  for (let i = current + 1; i < steps.length; ++i) steps[i].status = 'wait';
  const currentStep = steps[current];

  if (error) {
    currentStep.status = 'error';
  } else {
    currentStep.status = 'process';
    currentStep.icon = <LoadingOutlined/>;
  }

  return (
    <div className={'app-loading-status'}>
      <h2>Загрузка сессии...</h2>
      <Steps items={steps} current={current} style={{margin: '0 2em'}}/>
      {error && <LoadingErrorMessage error={error}/>}
    </div>
  );
};

const LoadingErrorMessage = ({error}: {error: string}) => {
  const location = useAppLocation();
  const { t } = useTranslation();

  return (
    <>
      <p>{t(error)}</p>
      <Link to={location}><LeftCircleOutlined/> {t('menu.back')}</Link>
    </>
  );
};
