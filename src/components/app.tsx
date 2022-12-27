import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchConfig, fetchSystems } from "../store/thunks";
import { selectors } from "../store";

import { SystemList } from "./system-list";
import { SystemRoot } from "./system-root";
import { UnknownRoute } from "./common/unknown-route";
import { LoadingStatus } from "./common/loading-status";

import "@progress/kendo-theme-default/dist/all.css";
import "flexlayout-react/style/light.css";
import "../styles/custom.css";


/** Корень приложения. */
export default function App() {
  const dispatch = useDispatch();
  const { config: configState, systemList: systemListState } = useSelector(selectors.appState);

  // Загрузка клиенсткой конфигурации и списка систем
  useEffect(() => {
    if (configState.success === undefined && !configState.loading) {
      dispatch(fetchConfig());
    }
    if (configState.success && systemListState.success === undefined && !systemListState.loading) {
      dispatch(fetchSystems());
    }
  }, [configState, systemListState, dispatch]);

  if (configState.loading || !configState.data) return <LoadingStatus loadingType={'config'}/>;
  if (configState.success === false) return <LoadingStatus loadingType={'config'} success={false}/>;
  const root = configState.data.root;

  return (
    <BrowserRouter>
      <Routes>
        <Route path={root}>
          <Route path={''} element={ <SystemList root={root} systemListState={systemListState}/> }/>
          <Route path={'systems/:systemID'} element={ <SystemRoot root={root}/> }/>
        </Route>
        <Route path={'*'} element={ <UnknownRoute root={root}/> }/>
      </Routes>
    </BrowserRouter>
  );
}
