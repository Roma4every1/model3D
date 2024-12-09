import type { ThemeConfig } from 'antd';
import type { RGBColor } from 'd3-color';
import { rgb } from 'd3-color';


/** Переопределение стилей компонентов. */
const componentConfig: ThemeConfig['components'] = {
  Select: {optionPadding: '4px 6px', optionHeight: 24},
  DatePicker: {cellWidth: 32, cellHeight: 16, textHeight: 24},
  Tabs: {horizontalMargin: '0', titleFontSizeSM: 13, horizontalItemPaddingSM: '1px 6px 3px'},
  Tree: {fontFamily: 'Roboto', fontSize: 12.5, controlHeightSM: 20},
  Collapse: {fontFamily: 'Roboto'},
};

/** Размер компонентов AntDesign по умолчанию. */
export const antdComponentSize = 'small';

/** Создаёт конфиг темы AntDesign под акцентный цвет системы. */
export function createAntDesignTheme(accentColor: ColorString): ThemeConfig {
  const seed: RGBColor = rgb(accentColor ?? '#808080');
  const globalStyles = document.body.style;

  globalStyles.setProperty('--wm-primary', seed.formatHex());
  globalStyles.setProperty('--wm-primary-60', themeColor(seed, 0.60));
  globalStyles.setProperty('--wm-primary-70', themeColor(seed, 0.70));
  globalStyles.setProperty('--wm-primary-85', themeColor(seed, 0.85));

  return {
    token: {fontSize: 12, colorPrimary: accentColor},
    components: componentConfig,
  };
}

/**
 * Цвета для цветовой схемы получаются в результате наложения на акцентный
 * цвет системы белого цвета с каким-либо коэффициентом прозрачности.
 */
function themeColor(seed: RGBColor, alpha: number): ColorString {
  const k1 = 1 - alpha;
  const k2 = alpha * 255;

  const r = Math.round(k1 * seed.r + k2);
  const g = Math.round(k1 * seed.g + k2);
  const b = Math.round(k1 * seed.b + k2);
  return rgb(r, g, b).formatHex();
}
