import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { propertyWindowConfig } from '../../../lib/constants.ts';
import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import { setMapField } from '../../../store/map.actions';


interface PropertiesWindowProps {
  id: FormID;
  stage: IMapStage;
  element: MapElement;
  close: () => void;
  cancel: () => void;
}


export const PropertiesWindow = ({id, stage, element, close, cancel}: PropertiesWindowProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const isCreating = stage.isElementCreating();
  const TypedPropertyWindow = propertyWindowConfig[element.type].component;

  const apply = () => {
    if (isCreating) {
      stage.accept();
    } else {
      stage.getActiveElementLayer().modified = true;
      stage.setSelecting(true); stage.render();
      dispatch(setMapField(id, 'modified', true));
    }
    close();
  };

  return (
    <LocalizationProvider language={'ru-RU'}>
      <IntlProvider locale={'ru'}>
        <TypedPropertyWindow
          element={element} isElementCreating={isCreating}
          update={() => stage.render()} apply={apply} cancel={cancel} t={t}
        />
      </IntlProvider>
    </LocalizationProvider>
  );
};
