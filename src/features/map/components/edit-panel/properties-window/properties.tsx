import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { MapMode, propertyWindowConfig } from '../../../lib/constants.ts';
import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import { mapStateSelector } from '../../../store/map.selectors';
import { setMapField, setEditMode, acceptCreatingElement } from '../../../store/map.actions';


interface PropertiesWindowProps {
  id: FormID;
  init: MapElement;
  close: () => void;
  cancel: () => void;
}


export const PropertiesWindow = ({id, init, close, cancel}: PropertiesWindowProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const mapState: MapState = useSelector(mapStateSelector.bind(id));

  const { element, utils, isElementCreating } = mapState;
  const [editedElement] = useState(element);

  useEffect(() => {
    if (element !== editedElement) cancel();
  }, [element, editedElement, cancel]);

  const TypedPropertyWindow = propertyWindowConfig[element.type].component;
  if (!TypedPropertyWindow) return <div>{t('map.selecting.no-selected')}</div>;

  const apply = () => {
    if (isElementCreating) {
      dispatch(acceptCreatingElement(id));
    } else {
      const modifiedLayer = mapState.mapData.layers.find(l => l.elements.includes(element));
      modifiedLayer.modified = true;
      dispatch(setMapField(id, 'isModified', true));
      dispatch(setEditMode(id, MapMode.SELECTING));
      utils.updateCanvas();
    }
    close();
  };

  return (
    <LocalizationProvider language={'ru-RU'}>
      <IntlProvider locale={'ru'}>
        <TypedPropertyWindow
          element={element} init={init} isElementCreating={isElementCreating}
          update={utils.updateCanvas} apply={apply} cancel={cancel} t={t}
        />
      </IntlProvider>
    </LocalizationProvider>
  );
};
