import type { CaratColumnYAxis } from '../../lib/dto.types';
import type { TextBoxChangeEvent, NumericTextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { TextBox, NumericTextBox } from '@progress/kendo-react-inputs';

import { useEffect } from 'react';
import { useRerender } from 'shared/react';
import { MenuSection, IconRow, IconRowButton } from 'shared/ui';

import { CaratStage } from '../../rendering/stage';
import { constraints } from '../../lib/constants';

import yAxisIcon from 'assets/images/carat/y-axis.svg';
import yAxisAbsMarksIcon from 'assets/images/carat/y-axis-abs-marks.svg';
import yAxisDepthMarksIcon from 'assets/images/carat/y-axis-depth-marks.svg';
import yAxisGridIcon from 'assets/images/carat/y-axis-grid.svg';


interface StageProps {
  stage: CaratStage;
}


/** Панель настроек активной группы колонок. */
export const CaratActiveGroupSection = ({stage}: StageProps) => {
  return (
    <MenuSection header={'Настройки активной колонки'} className={'carat-active-column'}>
      <GroupCommonSettings stage={stage}/>
      <GroupYAxisSettings stage={stage}/>
    </MenuSection>
  );
};

const GroupCommonSettings = ({stage}: StageProps) => {
  const rerender = useRerender();
  const track = stage.getActiveTrack();
  const activeGroup = track.getActiveGroup();

  useEffect(() => {
    stage.subscribe('group', rerender);
    return () => stage.unsubscribe('group', rerender);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const onLabelChange = ({value}: TextBoxChangeEvent) => {
    if (typeof value !== 'string') return;
    stage.setGroupLabel(track.getActiveIndex(), value);
    stage.render();
  };
  const onWidthChange = ({value}: NumericTextBoxChangeEvent) => {
    if (value === null) value = 0;
    if (value < minWidth || value > maxWidth) return;
    stage.setGroupWidth(track.getActiveIndex(), value);
    stage.render();
  };
  const onStepChange = ({value}: NumericTextBoxChangeEvent) => {
    if (!value || value < minStep || value > maxStep) return;
    stage.setGroupYStep(track.getActiveIndex(), value);
    stage.render();
  };

  const maxLabelLength = constraints.groupLabel.max;
  const { min: minStep, max: maxStep } = constraints.groupStep;
  const { min: minWidth, max: maxWidth } = constraints.groupWidth;

  return (
    <>
      <div>
        <span>Имя:</span>
        <TextBox
          maxLength={maxLabelLength} spellCheck={false}
          value={activeGroup?.settings.label} onChange={onLabelChange}
        />
      </div>
      <div>
        <span>Шаг:</span>
        <NumericTextBox
          format={'#'} min={minStep} max={maxStep} step={1}
          value={activeGroup?.yAxis.step} onChange={onStepChange}
        />
      </div>
      <div>
        <span>Ширина:</span>
        <NumericTextBox
          format={'#'} min={minWidth} max={maxWidth} step={5}
          value={activeGroup?.getWidth()} onChange={onWidthChange}
        />
      </div>
    </>
  );
};

const GroupYAxisSettings = ({stage}: StageProps) => {
  const rerender = useRerender();
  const track = stage.getActiveTrack();
  const settings = track.getActiveGroup()?.yAxis ?? {} as CaratColumnYAxis;

  useEffect(() => {
    stage.subscribe('group', rerender);
    return () => stage.unsubscribe('group', rerender);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = () => {
    const idx = track.getActiveIndex();
    stage.setGroupYAxis(idx, settings);
    stage.render();
  };

  const onShowChange = () => {
    settings.show = !settings.show;
    onChange();
  };
  const onShowAbsMarksChange = () => {
    settings.absMarks = !settings.absMarks;
    onChange();
  };
  const onShowDepthMarksChange = () => {
    settings.depthMarks = !settings.depthMarks;
    onChange();
  };
  const onShowGridChange = () => {
    settings.grid = !settings.grid;
    onChange();
  };

  return (
    <IconRow justifyContent={'center'} gap={2}>
      <IconRowButton
        icon={yAxisIcon} alt={'y-axis'} title={'Показывать ось'}
        active={settings.show} onClick={onShowChange}
      />
      <IconRowButton
        icon={yAxisDepthMarksIcon} alt={'y-axis-depth-marks'} title={'Показывать отметку глубины'}
        active={settings.depthMarks} onClick={onShowDepthMarksChange}
      />
      <IconRowButton
        icon={yAxisAbsMarksIcon} alt={'y-axis-abs-marks'} title={'Показывать абсолютную отметку'}
        active={settings.absMarks} onClick={onShowAbsMarksChange} disabled={!track.inclinometry}
      />
      <IconRowButton
        icon={yAxisGridIcon} alt={'y-axis-grid'} title={'Показывать сетку'}
        active={settings.grid} onClick={onShowGridChange}
      />
    </IconRow>
  );
};
