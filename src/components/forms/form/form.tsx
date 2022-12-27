import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formDict } from "../../../dicts/forms";
import { actions, selectors } from "../../../store";
import ErrorBoundary from "../../common/error-boundary";
import { MultiMap } from "../grid/multi-map";


/** Обобщённый компонент всех типов форм. */
export default function Form({formData, data}) {
  const sessionManager = useSelector(selectors.sessionManager);
  const dispatch = useDispatch();

  const {id: formID, type: formType} = formData;
  const isDataSet = formType === 'dataSet';

  const _form = useRef(null);
  const [formLoadedData, setFormLoadedData] = useState({
    formId: formID,
    loaded: false,
    activeChannels: data?.activeChannels ?? [],
    activeParams: [],
    settings: {},
  });

  useEffect(() => {
    let ignore = false;
    if (!data) {
      if (!formLoadedData.loaded) {
        async function fetchParams() {
          return await sessionManager.paramsManager.loadFormParameters(formID, false);
        }
        async function fetchChannels() {
          return await sessionManager.channelsManager.loadFormChannelsList(formID);
        }
        async function fetchSettings() {
          const force = formType !== 'dataSet' && formType !== 'grid';
          return await sessionManager.paramsManager.loadFormSettings(formID, force);
        }

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
      const load = async (channel) => {
        return await sessionManager.channelsManager.loadAllChannelData(channel, formID, false);
      }
      Promise.all(formLoadedData.activeChannels.map(load)).then(() => {
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
      if (formLoadedData.loaded) sessionManager.channelsManager.setFormInactive(formID);
    };
  }, [formID, formType, formLoadedData, data, sessionManager]);

  const FormByType = formDict[formType];

  useLayoutEffect(() => {
    if (isDataSet) dispatch(actions.setFormRefs(formID, _form));
  }, [formID, isDataSet, dispatch]);

  const formRef = isDataSet ? _form : undefined;
  const multiMapChannel = formLoadedData.settings['multiMapChannel'];
  if (!formLoadedData.loaded) return <div className={'form-container'}/>;
  if (multiMapChannel) return <MultiMap formID={formData.id} channel={multiMapChannel}/>;

  return (
    <ErrorBoundary>
      <div className={'form-container form-' + formType}>
        <FormByType key={'mainForm'} formData={formData} data={formLoadedData} ref={formRef}/>
      </div>
    </ErrorBoundary>
  );
}
