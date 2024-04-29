import { useEffect } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';

import { ConfigProvider } from 'antd';
import { ru_RU } from 'shared/locales';
import { createAntDesignTheme, antdComponentSize } from 'shared/ui';

import { useAppStore } from '../store/app.store';
import { setSystemName } from '../store/app.actions';
import { startSession } from '../store/root-form.thunks';
import { useFetchState } from 'entities/fetch-state';

import { Dock } from './dock';
import { LoadingStatus } from './loading-status';
import { WindowHandler } from 'entities/window/components/windows';
import { Notifications } from 'entities/notification';
import { TopToolbar } from './top-toolbar';


/** Корень системы. Route: `/systems/:systemID`. */
export const SystemRoot = () => {
  const fetchState = useFetchState('session');
  const { systemList, systemID, config } = useAppStore();

  const { systemID: paramsSystemID } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultSession = searchParams.get('defaultSession') === 'true';
  const systemInfo = systemList?.find(system => system.id === paramsSystemID);

  const needStartSession = systemInfo &&
    (fetchState.needFetch() || paramsSystemID !== systemID || defaultSession);

  // обновление ID системы
  useEffect(() => {
    if (paramsSystemID !== systemID) setSystemName(paramsSystemID);
  }, [paramsSystemID, systemID]);

  // инициализация новой сессии
  useEffect(() => {
    if (!needStartSession) return;
    if (defaultSession) setSearchParams({});
    startSession(defaultSession).then();
  }, [needStartSession, defaultSession, searchParams, setSearchParams]);

  if (fetchState.ok()) {
    const theme = createAntDesignTheme(systemInfo.color);
    return (
      <ConfigProvider locale={ru_RU} theme={theme} componentSize={antdComponentSize}>
        <Dock config={config}/>
        <TopToolbar config={config}/>
        <WindowHandler/>
        <Notifications/>
      </ConfigProvider>
    );
  }

  if (config === null) return <LoadingStatus loadingType={'systems'}/>;
  if (!systemList) return <LoadingStatus loadingType={'systems'} success={false}/>;
  if (!systemInfo) return <Navigate to={config.root} replace={true}/>;

  if (fetchState.notLoaded()) return <LoadingStatus loadingType={'session'}/>;
  return <LoadingStatus loadingType={'session'} success={false}/>;
};
