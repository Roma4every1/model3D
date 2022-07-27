import React, { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setSystemName } from "../store/actionCreators/appState";
import { startSession } from "../store/thunks";

import LoadingStatus from "./common/LoadingStatus";
import SessionLoader from "./SessionLoader";


/** Проверяет, есть ли указанная система в списке доступных систем. */
const checkSystem = (systemName, systemList) => {
  return systemList.find((system) => system.id === systemName);
}

/** Компонент, использующийся если система не найдена. */
const SystemNotFound = ({root, name}) => {
  const { t } = useTranslation();
  return (
    <div style={{padding: '2em', fontSize: '1.15rem'}}>
      <div>{t('systems.notFound', {systemName: name})}</div>
      <Link to={root}>&#11176; {t('systems.backToSystemList')}</Link>
    </div>
  );
}

/** Корень системы. Route: `/systems/:systemID`. */
const SystemRoot = ({root}) => {
  const dispatch = useDispatch();
  const { systemID } = useParams();

  const appState = useSelector((state) => state.appState);
  const sessionManager = useSelector((state) => state.sessionManager);

  const isSystemExist = useMemo(() => {
    return appState.systemList.data && checkSystem(appState.systemID, appState.systemList.data);
  }, [appState]);

  const readyToStartSession = useMemo(() => {
    return appState.systemList.loaded && !appState.sessionID.loaded && appState.systemID && sessionManager;
  }, [appState, sessionManager])

  const allReady = useMemo(() => {
    return appState.systemID
      && appState.config.loaded && appState.config.success
      && appState.systemList.loaded && appState.systemList.success
      && appState.sessionID.loaded && appState.sessionID.success;
  }, [appState]);

  useEffect(() => {
    if (systemID !== appState.systemID) {
      dispatch(setSystemName(systemID));
    }
    if (readyToStartSession) {
      dispatch(startSession(sessionManager.startSession));
    }
  }, [dispatch, systemID, appState, sessionManager, readyToStartSession]);

  if (allReady) {
    return isSystemExist ? <SessionLoader /> : <SystemNotFound name={systemID} root={root}/>;
  }

  if (!appState.config.loaded) {
    return <LoadingStatus loadingType={'config'}/>;
  }
  if (appState.config.success === false) {
    return <LoadingStatus loadingType={'config'} success={false}/>;
  }
  if (!appState.systemList.loaded) {
    return <LoadingStatus loadingType={'systems'}/>;
  }
  if (appState.systemList.success === false) {
    return <LoadingStatus loadingType={'systems'} success={false}/>;
  }
  if (!appState.sessionID.loaded) {
    return <LoadingStatus loadingType={'session'} />;
  }
  if (appState.sessionID.success === false) {
    return <LoadingStatus loadingType={'session'} success={false}/>
  }
  return <LoadingStatus loadingType={''}/>;
}

export default SystemRoot;
