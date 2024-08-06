import type { ThemeConfig } from 'antd';


const componentConfig: ThemeConfig['components'] = {
  Select: {optionPadding: '4px 6px', optionHeight: 24},
  DatePicker: {cellWidth: 32, cellHeight: 16, textHeight: 24},
  Tabs: {horizontalMargin: '0', titleFontSizeSM: 13, horizontalItemPaddingSM: '1px 6px 3px'},
};

/** Создаёт конфиг темы AntDesign под акцентный цвет системы. */
export function createAntDesignTheme(accentColor: ColorString): ThemeConfig {
  if (!accentColor) accentColor = '#808080';
  document.body.style.setProperty('--wm-system-color', accentColor);

  return {
    token: {fontSize: 12, colorPrimary: accentColor},
    components: componentConfig,
  };
}

export const antdComponentSize = 'small';
