import { useEffect } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router';

import { ConfigProvider } from 'antd';
import { ru_RU } from 'shared/locales';
import { createAntDesignTheme, antdComponentSize } from 'shared/ui';

import { useAppStore } from '../store/app.store';
import { startSession } from '../store/session';

import { Dock } from './dock';
import { AppLoadingStatus } from './loading-status';
import { WindowHandler } from 'entities/window/components/windows';
import { Notifications } from 'entities/notification';
import { TopLeftToolbar, TopRightToolbar } from './top-toolbar';


/** Корень системы. Route: `/systems/:systemID`. */
export const SystemRoot = () => {
  const { systemID: paramsSystemID } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { location, systemList, systemID, loading, instanceController } = useAppStore();

  const defaultSession = searchParams.get('defaultSession') === 'true';
  const systemInfo = systemList?.find(system => system.id === paramsSystemID);

  const needStartSession = systemInfo &&
    (loading.step === 'wait' || paramsSystemID !== systemID || defaultSession);

  // обновление ID системы
  useEffect(() => {
    if (paramsSystemID !== systemID) useAppStore.setState({systemID: paramsSystemID});
  }, [paramsSystemID, systemID]);

  // инициализация новой сессии
  useEffect(() => {
    if (!needStartSession) return;
    if (defaultSession) setSearchParams({});
    startSession(defaultSession).then();
  }, [needStartSession, defaultSession, searchParams, setSearchParams]);

  if (loading.step !== 'init' && !systemInfo) return <Navigate to={location} replace/>;
  if (!loading.done) return <AppLoadingStatus {...loading}/>;
  const theme = createAntDesignTheme(systemInfo.color);

  return (
    <ConfigProvider locale={ru_RU} theme={theme} componentSize={antdComponentSize}>
      <Dock/>
      {instanceController.main && <TopLeftToolbar location={location}/>}
      {instanceController.main && <TopRightToolbar systemInfo={systemInfo}/>}
      <WindowHandler/>
      <Notifications/>
    </ConfigProvider>
  );
};
