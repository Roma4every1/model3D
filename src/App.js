import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchConfig, fetchSystems } from "./store/thunks";

import SystemList from "./components/SystemList";
import SystemRoot from "./components/SystemRoot";
import UnknownRoute from "./components/common/UnknownRoute";
import LoadingStatus from "./components/common/LoadingStatus";

import "@progress/kendo-theme-default/dist/all.css";
import "flexlayout-react/style/light.css";
import "./styles/custom.css";


/** Корень приложения. */
export default function App() {
  const dispatch = useDispatch();
  const { config, systemList } = useSelector((state) => state.appState);

  // Загрузка клиенсткой конфигурации и списка систем
  useEffect(() => {
    if (!config.loaded) {
      dispatch(fetchConfig());
    }
    if (config.success && !systemList.loaded) {
      dispatch(fetchSystems());
    }
  }, [config, systemList, dispatch]);

  if (!config.loaded) return <LoadingStatus loadingType={'config'}/>;
  const root = config.data.root;

  return (
    <BrowserRouter>
      <Routes>
        <Route path={root}>
          <Route path={''} element={ <SystemList root={root} systemListState={systemList}/> }/>
          <Route path={'systems/:systemID'} element={ <SystemRoot root={root}/> }/>
          <Route path={'*'} element={ <UnknownRoute root={root}/> }/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
