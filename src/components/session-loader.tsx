import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { actions } from "../store";
import { API } from "../api/api";

import Form from './forms/form/form';
import { LoadingStatus } from "./common/loading-status";
import { WindowHandler } from "./common/window-handler";


export const SessionLoader = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<FormDataWMR>();

  useEffect(() => {
    if (formData) return;
    API.forms.getRootForm().then((res) => {
      if (!res.ok) return;
      dispatch(actions.setRootFormID(res.data.id));
      setFormData(res.data);
    });
  }, [formData, dispatch]);

  return (
    <>
      {!formData
        ? <LoadingStatus loadingType={'session'}/>
        : <Form formData={formData} data={undefined}/>}
      <WindowHandler />
    </>
  );
}
