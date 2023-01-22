import { useEffect, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { startSession } from "../store/thunks";
import { actions, selectors } from "../store";

import { Dock } from "./forms/dock/dock";
import { LoadingStatus } from "./common/loading-status";
import { WindowHandler } from "./common/window-handler";


/** Проверяет, есть ли указанная система в списке доступных систем. */
const checkSystem = (systemName: string, systemList: SystemList): boolean => {
  return systemList.find((system) => system.id === systemName) !== undefined;
};

/** Компонент, использующийся если система не найдена. */
const SystemNotFound = ({root, name}: {root: string, name: string}) => {
  const { t } = useTranslation();
  return (
    <div style={{padding: '2em', fontSize: '1.15rem'}}>
      <div>{t('systems.notFound', {systemName: name})}</div>
      <Link to={root}>&#11176; {t('systems.backToSystemList')}</Link>
    </div>
  );
};

/** Корень системы. Route: `/systems/:systemID`. */
export const SystemRoot = () => {
  const dispatch = useDispatch();
  const { systemList, systemID, sessionID, config } = useSelector(selectors.appState);

  const { systemID: paramsSystemID } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const isNeedStartSession = useMemo(() => {
    const isSystemExist = systemList && checkSystem(paramsSystemID, systemList);
    const isSessionNeedLoad = sessionID.success === undefined && sessionID.loading === false;
    return isSystemExist && (isSessionNeedLoad || paramsSystemID !== systemID);
  }, [sessionID, systemList, systemID, paramsSystemID]);

  useEffect(() => {
    if (paramsSystemID !== systemID) dispatch(actions.setSystemName(paramsSystemID));
  }, [paramsSystemID, systemID, dispatch]);

  useEffect(() => {
    if (isNeedStartSession) {
      const isDefault = searchParams.get('defaultSession') === 'true';
      if (isDefault) setSearchParams({});
      dispatch(startSession.bind(isDefault));
    }
  }, [isNeedStartSession, searchParams, setSearchParams, dispatch]);

  if (sessionID.success) return <><Dock/><WindowHandler/></>;

  if (config === null) {
    return <LoadingStatus loadingType={'systems'}/>;
  }
  if (!systemList) {
    return <LoadingStatus loadingType={'systems'} success={false}/>;
  }
  if (sessionID.loading) {
    return <LoadingStatus loadingType={'session'} />;
  }
  if (sessionID.success === false) {
    return <LoadingStatus loadingType={'session'} success={false}/>
  }
  return <SystemNotFound name={systemID} root={config.root}/>;
};
