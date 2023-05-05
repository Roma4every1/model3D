import { useState, useEffect } from 'react';
import { MenuSection, MenuSectionItem, BigButtonToggle } from 'shared/ui';
import { NumericTextBox, NumericTextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { CurveManager } from '../../lib/curve-manager';
import { CaratCurveModel } from '../../lib/types';
import { defaultSettings } from '../../lib/constants';
import autoSettingIcon from 'assets/images/carat/column-width.svg';


interface CurveTypesSectionProps {
  stage: ICaratStage,
  group: ICaratColumnGroup,
  curve: CaratCurveModel | null,
}
interface CurveTypeSettingsProps {
  settings: TypeSettingsModel,
  onClick: () => void,
}
interface ActiveTypeSettingsProps {
  stage: ICaratStage,
  manager: CurveManager,
  settings: TypeSettingsModel,
  onChange: () => void,
}

interface TypeSettingsModel {
  type: CaratCurveType,
  color: ColorHEX,
  measure: CaratCurveMeasure,
  active: boolean,
}


export const CurveTypesSection = ({stage, group, curve}: CurveTypesSectionProps) => {
  const curveManager: CurveManager = group?.curveManager;
  const curveTypes = curveManager.getCurveTypes();

  const [models, setModels] = useState<TypeSettingsModel[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

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
  }, [curve]); // eslint-disable-line

  const settings = models[activeIndex] ?? models[0];
  models.forEach((model) => { model.active = false; });
  if (settings) settings.active = true;

  const modelToSettings = (model: TypeSettingsModel, i: number) => {
    const onClick = () => setActiveIndex(i);
    return <CurveTypeSettings key={i} settings={model} onClick={onClick}/>
  };

  const onChange = () => {
    setModels([...models]);
  };

  return (
    <>
      <MenuSection header={'Типы кривых'}>
        <div className={'carat-tracks'} style={{width: 420}}>
          {models.map(modelToSettings)}
        </div>
      </MenuSection>
      <ActiveTypeSettings stage={stage} manager={curveManager} settings={settings} onChange={onChange}/>
    </>
  );
};

const CurveTypeSettings = ({settings, onClick}: CurveTypeSettingsProps) => {
  const min = settings.measure?.min;
  const max = settings.measure?.max;
  const className = 'curve-type-settings' + (settings.active ? ' active' : '');

  return (
    <div className={className} onClick={onClick}>
      <div style={{backgroundColor: settings.color}}/>
      <div>{settings.type}</div>
      <div>
        {typeof min === 'number' && <div>&darr; {min}</div>}
        {typeof max === 'number' && <div>&uarr; {max}</div>}
      </div>
    </div>
  );
};

const ActiveTypeSettings = ({stage, manager, settings, onChange}: ActiveTypeSettingsProps) => {
  const [min, setMin] = useState(null);
  const [max, setMax] = useState(null);

  const [auto, setAuto] = useState(false);
  const [valid, setValid] = useState(true);
  const sectionHeader = settings ? `Настройки типа (${settings.type})` : 'Настройки типа';

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
    setAuto(false);
  };

  const onMaxChange = (e: NumericTextBoxChangeEvent) => {
    changeMeasure(min, e.value);
    setAuto(false);
  };

  const reset = () => {
    changeMeasure(auto ? 0 : null, null);
    setAuto(!auto);
  };

  return (
    <MenuSection header={sectionHeader} className={'big-buttons'}>
      <MenuSectionItem className={'measure-settings'}>
        <span>Минимум:</span>
        <NumericTextBox value={min} valid={valid} onChange={onMinChange} style={{height: 24}}/>
        <span>Максимум:</span>
        <NumericTextBox value={max} valid={valid} onChange={onMaxChange} style={{height: 24}}/>
      </MenuSectionItem>
      <BigButtonToggle
        text={'Автонастройка'} icon={autoSettingIcon}
        action={reset} active={auto} disabled={settings === undefined}
      />
    </MenuSection>
  );
};
