import { useState, useEffect } from 'react';
import { TextBox, TextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { NumericTextBox, NumericTextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { MenuSection, ButtonIconRow, ButtonIconRowItem } from 'shared/ui';

import yAxisIcon from 'assets/images/carat/y-axis.svg';
import yAxisAbsMarksIcon from 'assets/images/carat/y-axis-abs-marks.svg';
import yAxisDepthMarksIcon from 'assets/images/carat/y-axis-depth-marks.svg';
import yAxisGridIcon from 'assets/images/carat/y-axis-grid.svg';


interface CaratActiveGroupPanelProps {
  stage: ICaratStage,
  track: ICaratTrack,
  activeGroup: ICaratColumnGroup,
}
interface GroupYAxisSettingsProps {
  stage: ICaratStage,
  settings: CaratColumnYAxis,
}


/** Панель настроек активной группы колонок. */
export const CaratActiveGroupPanel = ({stage, track, activeGroup}: CaratActiveGroupPanelProps) => {
  return (
    <MenuSection header={'Настройки активной колонки'} className={'carat-active-column'}>
      <GroupCommonSettings stage={stage} track={track} activeGroup={activeGroup}/>
      <GroupYAxisSettings stage={stage} settings={activeGroup.yAxis}/>
    </MenuSection>
  );
};

const GroupCommonSettings = ({stage, track, activeGroup}: CaratActiveGroupPanelProps) => {
  const [label, setLabel] = useState('');
  const [width, setWidth] = useState(null);
  const [step, setStep] = useState(null);

  useEffect(() => {
    if (!activeGroup) return;
    setLabel(activeGroup.settings.label);
    setWidth(activeGroup.getWidth());
    setStep(activeGroup.yAxis.step);
  }, [activeGroup]);

  const onLabelChange = (e: TextBoxChangeEvent) => {
    if (typeof e.value !== 'string') return;
    track.setActiveGroupLabel(e.value);
    stage.render();
    setLabel(e.value);
  };

  const onWidthChange = (e: NumericTextBoxChangeEvent) => {
    if (!e.value) return;
    track.setActiveGroupWidth(e.value);
    stage.resize(); stage.render();
    setWidth(e.value);
  };

  const onStepChange = (e: NumericTextBoxChangeEvent) => {
    if (!e.value) return;
    track.setActiveGroupYAxisStep(e.value);
    stage.render();
    setStep(e.value);
  };

  return (
    <>
      <div>
        <span>Имя:</span>
        <TextBox value={label} onChange={onLabelChange} spellCheck={false}/>
      </div>
      <div>
        <span>Шаг:</span>
        <NumericTextBox value={step} onChange={onStepChange} step={1} min={1} format={'#'}/>
      </div>
      <div>
        <span>Ширина:</span>
        <NumericTextBox value={width} onChange={onWidthChange} step={1} min={10} max={1000} format={'#'}/>
      </div>
    </>
  );
};

const GroupYAxisSettings = ({stage, settings}: GroupYAxisSettingsProps) => {
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
        icon={yAxisAbsMarksIcon} alt={'y-axis-abs-marks'} title={'Показывать абсолютную отметку'}
        active={showAbsMarks} onClick={onShowAbsMarksChange}
      />
      <ButtonIconRowItem
        icon={yAxisDepthMarksIcon} alt={'y-axis-depth-marks'} title={'Показывать отметку глубины'}
        active={showDepthMarks} onClick={onShowDepthMarksChange}
      />
      <ButtonIconRowItem
        icon={yAxisGridIcon} alt={'y-axis-grid'} title={'Показывать сетку'}
        active={showGrid} onClick={onShowGridChange}
      />
    </ButtonIconRow>
  );
};
