import React, {Suspense} from "react";
import {useDispatch, useSelector} from "react-redux";
import ErrorBoundary from "../common/ErrorBoundary";
import setFormRefs from "../../store/actionCreators/setFormRefs";
import {Skeleton} from "@progress/kendo-react-indicators";
import {capitalizeFirstLetter} from '../../utils';


/*
formData {
  displayName: string,
  displayNameString: string,
  id: string,
  type: string,
}
*/


export default function Form(props) {
  const { formData, data } = props;

  const sessionManager = useSelector((state) => state.sessionManager);
  const dispatch = useDispatch();

  const _form = React.useRef(null);
  const [formLoadedData, setFormLoadedData] = React.useState({
    formId: formData.id,
    loaded: false,
    activeChannels: data?.activeChannels ?? [],
    activeParams: [],
    settings: []
  });

  React.useEffect(() => {
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

  React.useEffect(() => {
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
  }, [formData, sessionManager, formLoadedData, data]);

  const FormByType = React.lazy(() => import('./' + capitalizeFirstLetter(formData.type)));

  React.useLayoutEffect(() => {
    dispatch(setFormRefs(formData.id, _form))
  }, [formData, dispatch]);

  const allPlugins = useSelector((state) => state.plugins.inner);
  const plugins = allPlugins.filter(plugin => plugin?.component?.form === capitalizeFirstLetter(formData.type));

  const skeleton = <Skeleton shape="rectangle" animation={{type: 'wave'}}/>;
  const suspenseContent = !formLoadedData.loaded ? skeleton :
    <div className="form-container">
      <FormByType key="mainForm" formData={formData} data={formLoadedData} ref={_form} />
        {plugins?.map(pl => {
          const PluginByType = React.lazy(() => import('./' + capitalizeFirstLetter(formData.type) + '/Plugins/' + pl.component.path));
          return <PluginByType key={pl.component.path} formId={formData.id} />
        })}
    </div>

  return (
    <ErrorBoundary>
      <Suspense fallback={skeleton}>{suspenseContent}</Suspense>
    </ErrorBoundary>
  );
}
