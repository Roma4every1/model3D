import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { formDict } from "../../../dicts/forms";
import { actions, sessionManager } from "../../../store";
import { MultiMap } from "../multi-map/multi-map";


interface FormProps {
  formData: FormDataWMR,
  channels?: ChannelName[],
}
interface FormState {
  formId: FormID,
  loaded: boolean,
  activeChannels: ChannelName[],
}


/** Обобщённый компонент всех типов форм. */
export default function Form({formData, channels}: FormProps) {
  const dispatch = useDispatch();

  const formID = formData.id;
  const isDataSet = formData.type === 'dataSet';

  const [formState, setFormState] = useState<FormState>({
    formId: formID,
    loaded: false,
    activeChannels: channels ?? [],
  });

  useEffect(() => {
    let ignore = false;
    if (!channels) {
      if (!formState.loaded) {
        getFormState(formID, formData).then(data => {
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
            activeChannels: channels,
          });
        }
      });
    }

    return () => {
      ignore = true;
      if (formState.loaded) sessionManager.channelsManager.setFormInactive(formID);
    };
  }, [formID, formData, formState, channels]);

  const ref = useRef(null);
  const formRef = isDataSet ? ref : undefined;

  useLayoutEffect(() => {
    if (isDataSet) dispatch(actions.setFormRefs(formID, ref));
  }, [formID, isDataSet, dispatch]);

  if (!formState.loaded) return <div className={'form-container'}/>;
  if (formData.type === 'multiMap') return <MultiMap formID={formID}/>;

  const FormByType = formDict[formData.type];
  return (
    <div className={'form-container'}>
      <FormByType formData={formData} data={formState} ref={formRef}/>
    </div>
  );
}

/** Типы форм, для которых требуется запрос настроек. */
const needSettingsFormTypes: FormType[] = ['dataSet', 'grid', 'chart'];

async function getFormState(formID: FormID, formData: FormDataWMR): Promise<FormState> {
  await sessionManager.paramsManager.loadFormParameters(formID, false);
  const channels = await sessionManager.channelsManager.loadFormChannelsList(formID);

  const force = !needSettingsFormTypes.includes(formData.type);
  const settings = await sessionManager.paramsManager.loadFormSettings(formID, force) as any;

  if (settings.multiMapChannel) {
    formData.type = 'multiMap';
  } else if (settings.seriesSettings) {
    settings.tooltip = true;
    settings.dateStep = settings.seriesSettings[channels[0]]?.dateStep === 'Month' ? 'month' : 'year';
  }

  return {formId: formID, loaded: true, activeChannels: channels};
}
