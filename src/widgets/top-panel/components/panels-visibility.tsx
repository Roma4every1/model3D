import { hideLeftTab, showLeftTab } from 'widgets/left-panel';
import { setLeftLayout } from 'widgets/left-panel/store/left-panel.actions';
import { BigButtonToggle, MenuSection } from 'shared/ui';

import globalParametersIcon from 'assets/common/global-parameters.png';
import presentationParametersIcon from 'assets/common/presentation-parameters.png';
import presentationsListIcon from 'assets/common/presentation-list.png';


/** Секция, отображающая видимость различных панелей управления. */
export const PanelsVisibility = ({leftLayout}: {leftLayout: LeftPanelLayout}) => {
  const toggleLeftVisible = (type: LeftTabType) => {
    (leftLayout[type].show ? hideLeftTab : showLeftTab)(leftLayout, type);
    setLeftLayout({...leftLayout});
  };

  return (
    <MenuSection header={'Панели'} className={'map-panel-main'} style={{display: 'flex'}}>
      <BigButtonToggle
        text={'Параметры'} icon={globalParametersIcon}
        active={leftLayout.globalParameters.show}
        action={() => toggleLeftVisible('globalParameters')}
      />
      <BigButtonToggle
        text={'Параметры презентации'} icon={presentationParametersIcon}
        active={leftLayout.presentationParameters.show}
        action={() => toggleLeftVisible('presentationParameters')}
        disabled={leftLayout.presentationParameters.disabled}
      />
      <BigButtonToggle
        text={'Презентации'} icon={presentationsListIcon}
        active={leftLayout.presentationTree.show}
        action={() => toggleLeftVisible('presentationTree')}
      />
    </MenuSection>
  );
};
