import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useRender } from 'shared/react';
import { mapEditConfig } from '../../lib/constants';
import { useMapState } from '../../store/map.store';
import { acceptMapEditing } from '../../store/map-edit.actions';
import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';


interface ElementEditWindowProps {
  id: FormID;
  element: MapElement;
  close: () => void;
  cancel: () => void;
}

export const ElementEditWindow = ({id, element, close, cancel}: ElementEditWindowProps) => {
  const render = useRender();
  const { t } = useTranslation();
  const { stage, edit } = useMapState(id);

  useEffect(() => {
    stage.subscribe('element-change', render);
    return () => stage.unsubscribe('element-change', render);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = () => stage.render();
  const apply = () => { acceptMapEditing(id); close(); }
  const Editor = mapEditConfig[element.type].propertyEditor.component;

  return (
    <LocalizationProvider language={'ru-RU'}>
      <IntlProvider locale={'ru'}>
        <Editor
          element={element} isElementCreating={edit.creating}
          update={update} apply={apply} cancel={cancel} t={t}
        />
      </IntlProvider>
    </LocalizationProvider>
  );
};
