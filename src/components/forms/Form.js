import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@progress/kendo-react-indicators";
import ErrorBoundary from "../common/ErrorBoundary";

import { capitalizeFirstLetter } from "../../utils";
import { formDict } from "../dicts/forms";
import { pluginsDict } from "../dicts/plugins";
import setFormRefs from "../../store/actionCreators/setFormRefs";

/*
formData {
  displayName: string,
  displayNameString: string,
  id: string,
  type: string,
}
*/


export default function Form({formData, data}) {
  const sessionManager = useSelector((state) => state.sessionManager);
  const dispatch = useDispatch();

  const _form = useRef(null);
  const [formLoadedData, setFormLoadedData] = useState({
    formId: formData.id,
    loaded: false,
    activeChannels: data?.activeChannels ?? [],
    activeParams: [],
    settings: []
  });

  useEffect(() => {
    if (formLoadedData.formId !== formData.id) {
      setFormLoadedData({
        formId: formData.id,
        loaded: false,
        activeChannels: formLoadedData.activeChannels,
        activeParams: formLoadedData.activeParams,
        settings: formLoadedData.settings
      });
    }
  }, [formData, formLoadedData]);

  useEffect(() => {
    let ignore = false;
    if (!data || data.needLoad) {

      async function fetchParams() {
        return await sessionManager.paramsManager.loadFormParameters(formData.id, false);
      }
      async function fetchChannels() {
        return await sessionManager.channelsManager.loadFormChannelsList(formData.id);
      }
      async function fetchSettings() {
        return await sessionManager.paramsManager.loadFormSettings(formData.id);
      }

      if (!formLoadedData.loaded) {
        Promise.all([fetchParams(), fetchChannels(), fetchSettings()]).then(values => {
          if (!ignore) {
            setFormLoadedData({
              formId: formData.id,
              loaded: true,
              activeChannels: values[1],
              activeParams: values[0],
              settings: values[2]
            });
          }
        });
      }
    } else {
      Promise.all(formLoadedData.activeChannels.map(async ch =>
        await sessionManager.channelsManager.loadAllChannelData(ch, formData.id, false)
      )).then(values => {
        if (!formLoadedData.loaded) {
            setFormLoadedData({
              formId: formData.id,
              loaded: true,
              activeChannels: data.activeChannels,
              activeParams: data.activeParams,
              settings: data.settings
            });
        }
      });
    }

    return () => {
      ignore = true;
      if (formLoadedData.loaded) {
        sessionManager.channelsManager.setFormInactive(formData.id);
      }
    };
  }, [formData, formLoadedData, data, sessionManager]);

  const FormByType = formDict[formData.type];

  useLayoutEffect(() => {
    dispatch(setFormRefs(formData.id, _form))
  }, [formData, dispatch]);

  const allPlugins = useSelector((state) => state.plugins.inner);
  const plugins = allPlugins.filter(plugin => plugin?.component?.form === capitalizeFirstLetter(formData.type));

  const pluginsByType = plugins?.map(pl => {
    const PluginByType = pluginsDict[formData.type.toLowerCase()][pl.component.path];
    return <PluginByType key={pl.component.path} formId={formData.id} />
  });

  return (
    <ErrorBoundary>
      {!formLoadedData.loaded
        ? <Skeleton shape={'rectangle'} animation={{type: 'wave'}}/>
        : <div className={'form-container'}>
            <FormByType key={'mainForm'} formData={formData} data={formLoadedData} ref={_form} />
            {pluginsByType}
          </div>
      }
    </ErrorBoundary>
  );
}
