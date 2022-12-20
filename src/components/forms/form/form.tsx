import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formDict } from "../../../dicts/forms";
import { actions, selectors } from "../../../store";
import ErrorBoundary from "../../common/error-boundary";


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
    if (!data) {
      async function fetchParams() {
        return await sessionManager.paramsManager.loadFormParameters(formID, false);
      }
      async function fetchChannels() {
        return await sessionManager.channelsManager.loadFormChannelsList(formID);
      }
      async function fetchSettings() {
        return await sessionManager.paramsManager.loadFormSettings(formID, !isDataSet);
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
  }, [formID, isDataSet, formLoadedData, data, sessionManager]);

  const FormByType = formDict[formType];

  useLayoutEffect(() => {
    if (isDataSet) dispatch(actions.setFormRefs(formID, _form));
  }, [formID, isDataSet, dispatch]);

  if (!formLoadedData.loaded) return <div className={'form-container'}/>;
  const formRef = isDataSet ? _form : undefined;

  return (
    <ErrorBoundary>
      <div className={'form-container form-' + formType}>
        <FormByType key={'mainForm'} formData={formData} data={formLoadedData} ref={formRef}/>
      </div>
    </ErrorBoundary>
  );
}
