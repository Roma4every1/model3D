import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formDict } from "../../../dicts/forms";
import { actions, selectors } from "../../../store";
import { MultiMap } from "../multi-map/multi-map";


interface FormState {
  formId: FormID,
  loaded: boolean,
  activeParams: any[],
  activeChannels: ChannelName[],
  settings: FormSettings,
}


/** Обобщённый компонент всех типов форм. */
export default function Form({formData, data}) {
  const sessionManager = useSelector(selectors.sessionManager);
  const dispatch = useDispatch();

  const formID = formData.id;
  const isDataSet = formData.type === 'dataSet';

  const [formState, setFormState] = useState<FormState>({
    formId: formID,
    loaded: false,
    activeChannels: data?.activeChannels ?? [],
    activeParams: [],
    settings: undefined,
  });

  useEffect(() => {
    let ignore = false;
    if (!data) {
      if (!formState.loaded) {
        getFormState(formID, formData, sessionManager).then(data => {
          if (!ignore) setFormState(data);
        });
      }
    } else {
      const load = async (channel) => {
        return await sessionManager.channelsManager.loadAllChannelData(channel, formID, false);
      }
      Promise.all(formState.activeChannels.map(load)).then(() => {
        if (!formState.loaded) {
          setFormState({
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
      if (formState.loaded) sessionManager.channelsManager.setFormInactive(formID);
    };
  }, [formID, formData, formState, data, sessionManager]);

  const ref = useRef(null);
  const formRef = isDataSet ? ref : undefined;

  useLayoutEffect(() => {
    if (isDataSet) dispatch(actions.setFormRefs(formID, ref));
  }, [formID, isDataSet, dispatch]);

  if (!formState.loaded) return <div className={'form-container'}/>;

  if (formData.type === 'multiMap') {
    const channel = formState.settings['multiMapChannel'];
    return <MultiMap formID={formID} channel={channel}/>;
  }

  const FormByType = formDict[formData.type];
  return (
    <div className={'form-container'}>
      <FormByType formData={formData} data={formState} ref={formRef}/>
    </div>
  );
}

const needSettingsFormTypes = ['dataSet', 'grid', 'chart'];

async function getFormState(formID: FormID, formData: FormDataWMR, sessionManager: SessionManager): Promise<FormState> {
  const params = await sessionManager.paramsManager.loadFormParameters(formID, false);
  const channels = await sessionManager.channelsManager.loadFormChannelsList(formID);

  const force = !needSettingsFormTypes.includes(formData.type);
  const settings = await sessionManager.paramsManager.loadFormSettings(formID, force) as any;

  if (settings.multiMapChannel) {
    formData.type = 'multiMap';
  } else if (settings.seriesSettings) {
    settings.tooltip = true;
    settings.dateStep = settings.seriesSettings[channels[0]]?.dateStep === 'Month' ? 'month' : 'year';
  }

  return {formId: formID, loaded: true, activeChannels: channels, activeParams: params, settings};
}
