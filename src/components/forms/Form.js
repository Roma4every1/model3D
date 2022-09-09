import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@progress/kendo-react-indicators";
import ErrorBoundary from "../common/ErrorBoundary";

import { capitalizeFirstLetter } from "../../utils";
import { formDict } from "../dicts/forms";
import { pluginsDict } from "../dicts/plugins";
import { actions } from "../../store";

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

  const {id: formID, type: formType} = formData;
  const _form = useRef(null);
  const [formLoadedData, setFormLoadedData] = useState({
    formId: formID,
    loaded: false,
    activeChannels: data?.activeChannels ?? [],
    activeParams: [],
    settings: []
  });

  useEffect(() => {
    if (formLoadedData.formId !== formID) {
      setFormLoadedData({
        formId: formID,
        loaded: false,
        activeChannels: formLoadedData.activeChannels,
        activeParams: formLoadedData.activeParams,
        settings: formLoadedData.settings
      });
    }
  }, [formID, formLoadedData]);

  useEffect(() => {
    let ignore = false;
    if (!data || data.needLoad) {

      async function fetchParams() {
        return await sessionManager.paramsManager.loadFormParameters(formID, false);
      }
      async function fetchChannels() {
        return await sessionManager.channelsManager.loadFormChannelsList(formID);
      }
      async function fetchSettings() {
        return await sessionManager.paramsManager.loadFormSettings(formID);
      }

      if (!formLoadedData.loaded) {
        Promise.all([fetchParams(), fetchChannels(), fetchSettings()]).then(values => {
          if (!ignore) {
            setFormLoadedData({
              formId: formID,
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
        await sessionManager.channelsManager.loadAllChannelData(ch, formID, false)
      )).then(() => {
        if (!formLoadedData.loaded) {
            setFormLoadedData({
              formId: formID,
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
        sessionManager.channelsManager.setFormInactive(formID);
      }
    };
  }, [formID, formLoadedData, data, sessionManager]);

  const FormByType = formDict[formType];

  useLayoutEffect(() => {
    dispatch(actions.setFormRefs(formID, _form));
  }, [formID, dispatch]);

  const allPlugins = useSelector((state) => state.layout.plugins.inner);
  const plugins = allPlugins.filter(plugin => plugin?.component?.form === capitalizeFirstLetter(formType));

  const pluginsByType = plugins?.map(pl => {
    const PluginByType = pluginsDict[formType.toLowerCase()][pl.component.path];
    return <PluginByType key={pl.component.path} formId={formID} />
  });

  return (
    <ErrorBoundary>
      {!formLoadedData.loaded
        ? <Skeleton shape={'rectangle'} animation={{type: 'wave'}}/>
        : <div className={`form-container ${formType}-form`}>
            {formType === 'map'
              ? <FormByType key={'mainForm'} formData={formData} data={formLoadedData} />
              : <FormByType key={'mainForm'} formData={formData} data={formLoadedData} ref={_form} />
            }
            {pluginsByType}
          </div>
      }
    </ErrorBoundary>
  );
}
