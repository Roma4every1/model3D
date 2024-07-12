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
        active={leftLayout.global.show} action={() => toggleLeftVisible('global')}
      />
      <BigButtonToggle
        text={'Параметры презентации'} icon={presentationParametersIcon}
        active={leftLayout.presentation.show} action={() => toggleLeftVisible('presentation')}
        disabled={leftLayout.presentation.disabled}
      />
      <BigButtonToggle
        text={'Презентации'} icon={presentationsListIcon}
        active={leftLayout.tree.show} action={() => toggleLeftVisible('tree')}
      />
    </MenuSection>
  );
};
