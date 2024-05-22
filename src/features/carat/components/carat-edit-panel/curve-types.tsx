import type { TFunction } from 'react-i18next';
import type { NumericTextBoxChangeEvent } from '@progress/kendo-react-inputs'
import type { CaratCurveMeasure } from '../../lib/dto.types';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRender } from 'shared/react';
import { MenuSection, MenuSectionItem, BigButtonToggle } from 'shared/ui';
import { NumericTextBox } from '@progress/kendo-react-inputs';

import { CaratStage } from '../../rendering/stage';
import { CurveManager } from '../../lib/curve-manager';
import { defaultSettings } from '../../lib/constants';
import autoSettingIcon from 'assets/images/carat/column-width.svg';


interface CurveTypesSectionProps {
  stage: CaratStage;
}
interface CurveTypeSettingsProps {
  settings: TypeSettingsModel;
  onClick: () => void;
}
interface ActiveTypeSettingsProps {
  stage: CaratStage;
  manager: CurveManager;
  settings: TypeSettingsModel;
  onChange: () => void;
  t: TFunction;
}

interface TypeSettingsModel {
  type: CaratCurveType;
  color: ColorString;
  measure: CaratCurveMeasure;
  active: boolean;
}


export const CurveTypesSection = ({stage}: CurveTypesSectionProps) => {
  const { t } = useTranslation();
  const render = useRender();

  const track = stage.getActiveTrack();
  const curve = track.getActiveCurve();
  const curveManager: CurveManager = track.getCurveGroup()?.getCurveColumn()?.curveManager;
  const curveTypes = curveManager.getCurveTypes();

  const [models, setModels] = useState<TypeSettingsModel[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    stage.subscribe('track', render);
    return () => stage.unsubscribe('track', render);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setModels(curveTypes.map((type) => ({
      type,
      color: curveManager.styleDict.get(type)?.color ?? defaultSettings.curveStyle.color,
      measure: curveManager.measures[type], active: false,
    })));
  }, [curveTypes, curveManager]);

  useEffect(() => {
    if (!curve) return;
    let index = models.findIndex((model) => curve.type.startsWith(model.type));
    if (index === -1) index = 0;
    setActiveIndex(index);
  }, [curve, models]);

  const settings = models[activeIndex];
  models.forEach((model) => { model.active = false; });
  if (settings) settings.active = true;

  const modelToSettings = (model: TypeSettingsModel, i: number) => {
    const onClick = () => setActiveIndex(i);
    return <CurveTypeSettings key={i} settings={model} onClick={onClick}/>
  };

  return (
    <>
      <MenuSection header={t('carat.types.header', {well: track.wellName})}>
        <div className={'carat-column-groups'} style={{width: 450}}>
          {models.map(modelToSettings)}
        </div>
      </MenuSection>
      <ActiveTypeSettings
        stage={stage} manager={curveManager}
        settings={settings} onChange={render} t={t}
      />
    </>
  );
};

const CurveTypeSettings = ({settings, onClick}: CurveTypeSettingsProps) => {
  const min = settings.measure?.min;
  const max = settings.measure?.max;
  const className = 'curve-type-settings' + (settings.active ? ' active' : '');

  return (
    <div className={className} onClick={onClick} style={{maxWidth: 150}}>
      <div style={{backgroundColor: settings.color}}/>
      <div>{settings.type}</div>
      <div>
        {typeof min === 'number' && <div>&darr; {min}</div>}
        {typeof max === 'number' && <div>&uarr; {max}</div>}
      </div>
    </div>
  );
};

const ActiveTypeSettings = ({stage, manager, settings, onChange, t}: ActiveTypeSettingsProps) => {
  const [min, setMin] = useState(null);
  const [max, setMax] = useState(null);

  const [auto, setAuto] = useState(false);
  const [valid, setValid] = useState(true);

  useEffect(() => {
    const min = settings?.measure?.min ?? null;
    const max = settings?.measure?.max ?? null;
    setMin(min); setMax(max);
    setValid(min === null || max === null || min < max);
    setAuto(settings?.measure === undefined);
  }, [settings]);

  const changeMeasure = (newMin: number | null, newMax: number | null) => {
    if (!settings) return;
    setMin(newMin); setMax(newMax);

    const valid = newMin === null || newMax === null || newMin < newMax;
    setValid(valid); if (!valid) return;

    settings.measure = {type: settings.type, min: newMin, max: newMax};
    manager.setMeasure(settings.type, newMin, newMax);
    stage.render(); onChange();
  };

  const onMinChange = (e: NumericTextBoxChangeEvent) => {
    changeMeasure(e.value, max);
    if (auto) setAuto(false);
  };

  const onMaxChange = (e: NumericTextBoxChangeEvent) => {
    changeMeasure(min, e.value);
    if (auto) setAuto(false);
  };

  const reset = () => {
    changeMeasure(auto ? 0 : null, null);
    setAuto(!auto);
  };

  let sectionHeader = t('carat.types.type-settings');
  if (settings) sectionHeader += ` (${settings.type})`;

  return (
    <MenuSection header={sectionHeader} className={'big-buttons'}>
      <MenuSectionItem className={'measure-settings'}>
        <span>{t('carat.types.min')}</span>
        <NumericTextBox
          style={{height: 24}} format={'#.###'}
          value={min} valid={valid} onChange={onMinChange}
        />
        <span>{t('carat.types.max')}</span>
        <NumericTextBox
          style={{height: 24}} format={'#.###'}
          value={max} valid={valid} onChange={onMaxChange}
        />
      </MenuSectionItem>
      <BigButtonToggle
        text={t('carat.types.auto')} icon={autoSettingIcon}
        action={reset} active={auto} disabled={settings === undefined}
      />
    </MenuSection>
  );
};
