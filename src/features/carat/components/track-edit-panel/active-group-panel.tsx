import { useState, useEffect } from 'react';
import { TextBox, TextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { NumericTextBox, NumericTextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { MenuSection, ButtonIconRow, ButtonIconRowItem } from 'shared/ui';
import { constraints } from '../../lib/constants';

import yAxisIcon from 'assets/images/carat/y-axis.svg';
import yAxisAbsMarksIcon from 'assets/images/carat/y-axis-abs-marks.svg';
import yAxisDepthMarksIcon from 'assets/images/carat/y-axis-depth-marks.svg';
import yAxisGridIcon from 'assets/images/carat/y-axis-grid.svg';


interface CaratActiveGroupPanelProps {
  stage: ICaratStage,
  track: ICaratTrack,
  activeGroup: ICaratColumnGroup,
  signal: () => void,
}
interface GroupYAxisSettingsProps {
  stage: ICaratStage,
  track: ICaratTrack,
  settings: CaratColumnYAxis,
}


/** Панель настроек активной группы колонок. */
export const CaratActiveGroupPanel = ({stage, track, activeGroup, signal}: CaratActiveGroupPanelProps) => {
  return (
    <MenuSection header={'Настройки активной колонки'} className={'carat-active-column'}>
      <GroupCommonSettings stage={stage} track={track} activeGroup={activeGroup} signal={signal}/>
      <GroupYAxisSettings stage={stage} track={track} settings={activeGroup.yAxis}/>
    </MenuSection>
  );
};

const GroupCommonSettings = ({stage, track, activeGroup, signal}: CaratActiveGroupPanelProps) => {
  const activeIndex = track.getActiveIndex();
  const maxLabelLength = constraints.groupLabel.max;
  const { min: minStep, max: maxStep } = constraints.groupStep;
  const { min: minWidth, max: maxWidth } = constraints.groupWidth;

  const [label, setLabel] = useState('');
  const [width, setWidth] = useState(null);
  const [step, setStep] = useState(null);

  useEffect(() => {
    if (!activeGroup) return;
    setLabel(activeGroup.settings.label);
    setWidth(activeGroup.getWidth());
    setStep(activeGroup.yAxis.step);
  }, [activeGroup]);

  const onLabelChange = ({value}: TextBoxChangeEvent) => {
    if (typeof value !== 'string') return;
    setLabel(value); signal();
    stage.edit({type: 'group-label', payload: {idx: activeIndex, label: value}});
    stage.render();
  };

  const onWidthChange = ({value}: NumericTextBoxChangeEvent) => {
    setWidth(value);
    if (value === null || value < minWidth || value > maxWidth) return;
    stage.edit({type: 'group-width', payload: {idx: activeIndex, width: value}});
    stage.resize(); stage.render();
  };

  const onStepChange = ({value}: NumericTextBoxChangeEvent) => {
    setStep(value);
    if (!value || value < minStep || value > maxStep) return;
    stage.edit({type: 'group-y-step', payload: {idx: activeIndex, step: value}});
    stage.render();
  };

  return (
    <>
      <div>
        <span>Имя:</span>
        <TextBox
          maxLength={maxLabelLength} spellCheck={false}
          value={label} onChange={onLabelChange}
        />
      </div>
      <div>
        <span>Шаг:</span>
        <NumericTextBox
          format={'#'} min={minStep} max={maxStep} step={1}
          value={step} onChange={onStepChange}
        />
      </div>
      <div>
        <span>Ширина:</span>
        <NumericTextBox
          format={'#'} min={minWidth} max={maxWidth} step={5}
          value={width} onChange={onWidthChange}
        />
      </div>
    </>
  );
};

const GroupYAxisSettings = ({stage, track, settings}: GroupYAxisSettingsProps) => {
  const [show, setShow] = useState(false);
  const [showAbsMarks, setShowAbsMarks] = useState(false);
  const [showDepthMarks, setShowDepthMarks] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    setShow(settings.show);
    setShowAbsMarks(settings.absMarks);
    setShowDepthMarks(settings.depthMarks);
    setShowGrid(settings.grid);
  }, [settings]);

  const onShowChange = () => {
    setShow(!show);
    settings.show = !show;
    stage.render();
  };

  const onShowAbsMarksChange = () => {
    setShowAbsMarks(!showAbsMarks);
    settings.absMarks = !showAbsMarks;
    stage.render();
  };

  const onShowDepthMarksChange = () => {
    setShowDepthMarks(!showDepthMarks);
    settings.depthMarks = !showDepthMarks;
    stage.render();
  };

  const onShowGridChange = () => {
    setShowGrid(!showGrid);
    settings.grid = !showGrid;
    stage.render();
  };

  return (
    <ButtonIconRow justifyContent={'center'} gap={2}>
      <ButtonIconRowItem
        icon={yAxisIcon} alt={'y-axis'} title={'Показывать ось'}
        active={show} onClick={onShowChange}
      />
      <ButtonIconRowItem
        icon={yAxisDepthMarksIcon} alt={'y-axis-depth-marks'} title={'Показывать отметку глубины'}
        active={showDepthMarks} onClick={onShowDepthMarksChange}
      />
      <ButtonIconRowItem
        icon={yAxisAbsMarksIcon} alt={'y-axis-abs-marks'} title={'Показывать абсолютную отметку'}
        active={showAbsMarks} onClick={onShowAbsMarksChange} disabled={!track.inclinometry}
      />
      <ButtonIconRowItem
        icon={yAxisGridIcon} alt={'y-axis-grid'} title={'Показывать сетку'}
        active={showGrid} onClick={onShowGridChange}
      />
    </ButtonIconRow>
  );
};
