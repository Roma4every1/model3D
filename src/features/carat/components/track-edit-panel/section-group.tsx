import type { ChangeEvent } from 'react';
import type { WindowProps } from '@progress/kendo-react-dialogs';
import type { CaratColumnYAxis } from '../../lib/dto.types';

import { useEffect } from 'react';
import { useRender } from 'shared/react';
import { Flex, Input, InputNumber, Button } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import { MenuSection, IconRow, IconRowButton } from 'shared/ui';
import { inputIntParser } from 'shared/locales';

import { showWindow } from 'entities/window';
import { CaratSettingsWindow } from '../windows/carat-settings';
import { CaratStage } from '../../rendering/stage';
import { constraints } from '../../lib/constants';

import yAxisIcon from 'assets/carat/y-axis.svg';
import yAxisAbsMarksIcon from 'assets/carat/y-axis-abs-marks.svg';
import yAxisDepthMarksIcon from 'assets/carat/y-axis-depth-marks.svg';
import yAxisGridIcon from 'assets/carat/y-axis-grid.svg';


interface StageProps {
  stage: CaratStage;
}


/** Панель настроек активной группы колонок. */
export const CaratActiveGroupSection = ({stage}: StageProps) => {
  const render = useRender();

  useEffect(() => {
    stage.subscribe('group', render);
    return () => stage.unsubscribe('group', render);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const openSettings = () => {
    const props: WindowProps = {width: 560, height: 250, title: 'Управление колонками'};
    showWindow('carat-settings', props, <CaratSettingsWindow stage={stage}/>);
  };

  return (
    <MenuSection header={'Настройки активной колонки'} className={'carat-active-column'}>
      <GroupCommonSettings stage={stage}/>
      <GroupYAxisSettings stage={stage}/>
      <Button onClick={openSettings} title={'Дополнительные настройки'} icon={<EllipsisOutlined/>}/>
    </MenuSection>
  );
};

const GroupCommonSettings = ({stage}: StageProps) => {
  const track = stage.getActiveTrack();
  const activeGroup = track.getActiveGroup();
  const { min: minWidth, max: maxWidth } = constraints.groupWidth;

  const onLabelChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (typeof value !== 'string') return;
    stage.setGroupLabel(track.getActiveIndex(), value);
    stage.render();
  };
  const onWidthChange = (value: number) => {
    if (value === null) value = 0;
    if (value < minWidth || value > maxWidth) return;
    stage.setGroupWidth(track.getActiveIndex(), value);
    stage.render();
  };

  return (
    <div className={'carat-column-common-settings'}>
      <span>Имя:</span>
      <Input
        maxLength={constraints.groupLabel.max} spellCheck={false}
        value={activeGroup?.settings.label} onChange={onLabelChange}
      />
      <span>Ширина:</span>
      <InputNumber
        style={{width: 100}}
        value={activeGroup?.getWidth()} onChange={onWidthChange} changeOnWheel={true}
        parser={inputIntParser} min={minWidth} max={maxWidth} step={5} precision={0}
      />
    </div>
  );
};

const GroupYAxisSettings = ({stage}: StageProps) => {
  const track = stage.getActiveTrack();
  const activeGroup = track.getActiveGroup();

  const { min: minStep, max: maxStep } = constraints.groupStep;
  const settings = activeGroup?.yAxis ?? {} as CaratColumnYAxis;

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

  const onStepChange = (value: number) => {
    if (!value || value < minStep || value > maxStep) return;
    stage.setGroupYStep(track.getActiveIndex(), value);
    stage.render();
  };

  return (
    <div className={'carat-column-y-axis-settings'}>
      <Flex gap={5}>
        <span>Шаг:</span>
        <InputNumber
          style={{width: 60}}
          value={activeGroup?.yAxis.step} onChange={onStepChange} changeOnWheel={true}
          parser={inputIntParser} min={minStep} max={maxStep} step={1} precision={0}
        />
      </Flex>
      <IconRow justify={'center'}>
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
    </div>
  );
};
