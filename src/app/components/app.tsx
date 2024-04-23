import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getAppLocation } from '../lib/initialization';
import { useAppStore } from '../store/app.store';
import { initialize } from '../store/app.actions';

import { SystemList } from './system-list';
import { SystemRoot } from './system-root';
import { UnknownRoute } from './unknown-route';


/** Корень приложения. */
export const App = () => {
  const { config, systemList } = useAppStore();
  const root = config ? config.root : getAppLocation();

  // загрузка клиенсткой конфигурации и списка систем
  useEffect(() => {
    if (config === null) initialize().then();
  }, [config]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path={root}>
          <Route path={''} element={ <SystemList config={config} list={systemList}/> }/>
          <Route path={'systems/:systemID'} element={ <SystemRoot/> }/>
        </Route>
        <Route path={'*'} element={ <UnknownRoute root={root}/> }/>
      </Routes>
    </BrowserRouter>
  );
};
