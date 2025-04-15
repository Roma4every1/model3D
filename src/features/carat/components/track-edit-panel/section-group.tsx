import type { ChangeEvent } from 'react';
import type { TFunction } from 'react-i18next';
import type { CaratColumnYAxis } from '../../lib/dto.types';

import { useEffect } from 'react';
import { useRender } from 'shared/react';
import { Flex, Input, InputNumber } from 'antd';
import { SyncOutlined, ColumnWidthOutlined } from '@ant-design/icons';
import { MenuSection, IconRow, IconRowButton, BigButton } from 'shared/ui';
import { inputIntParser } from 'shared/locales';

import { showWindow } from 'entities/window';
import { CaratSettingsWindow } from '../windows/carat-settings';
import { CaratStage } from '../../rendering/stage';
import { constraints } from '../../lib/constants';

import columnManageIcon from 'assets/table/column-visibility.svg';
import yAxisIcon from 'assets/carat/y-axis.svg';
import yAxisAbsMarksIcon from 'assets/carat/y-axis-abs-marks.svg';
import yAxisDepthMarksIcon from 'assets/carat/y-axis-depth-marks.svg';
import yAxisGridIcon from 'assets/carat/y-axis-grid.svg';


interface StageProps {
  stage: CaratStage;
  t: TFunction;
}


/** Панель настроек активной группы колонок. */
export const CaratActiveGroupSection = ({stage, t}: StageProps) => {
  const render = useRender();
  const title = t('carat.group.manage-title');

  useEffect(() => {
    stage.subscribe('group', render);
    return () => stage.unsubscribe('group', render);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const openSettings = () => {
    const content = <CaratSettingsWindow stage={stage}/>;
    showWindow('carat-settings', {width: 560, height: 250, title}, content);
  };

  return (
    <MenuSection header={t('carat.group.section-title')} className={'carat-active-column'}>
      <GroupCommonSettings stage={stage} t={t}/>
      <GroupYAxisSettings stage={stage} t={t}/>
      <BigButton
        text={t('carat.group.manage')} icon={columnManageIcon}
        onClick={openSettings} title={title}
      />
    </MenuSection>
  );
};

const GroupCommonSettings = ({stage, t}: StageProps) => {
  const render = useRender();
  const { min: minWidth, max: maxWidth } = constraints.groupWidth;

  const track = stage.getActiveTrack();
  const activeGroup = track.getActiveGroup();

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

  const adjustWidth = () => {
    stage.adjustWidth();
    stage.render();
  };
  const toggleAutoWidthMode = () => {
    stage.settings.autoWidth = !stage.settings.autoWidth;
    render();
  };

  return (
    <div className={'carat-column-common-settings'}>
      <span>{t('carat.group.name')}</span>
      <Input
        maxLength={constraints.groupLabel.max} spellCheck={false}
        value={activeGroup?.settings.label} onChange={onLabelChange}
      />
      <span>{t('carat.group.width')}</span>
      <Flex align={'center'} gap={4}>
        <InputNumber
          style={{width: 94}} controls={false}
          value={activeGroup?.getWidth()} onChange={onWidthChange} changeOnWheel={true}
          parser={inputIntParser} min={minWidth} max={maxWidth} step={5} precision={0}
          addonAfter={<SyncOutlined
            style={{padding: 5}} title={t('carat.group.auto-width')} onClick={adjustWidth}
          />}
        />
        <IconRow>
          <IconRowButton
            icon={<ColumnWidthOutlined/>} title={t('carat.group.auto-width-title')}
            active={stage.settings.autoWidth} onClick={toggleAutoWidthMode}
          />
        </IconRow>
      </Flex>
    </div>
  );
};

const GroupYAxisSettings = ({stage, t}: StageProps) => {
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
        <span>{t('carat.group.step')}</span>
        <InputNumber
          style={{width: 60}} controls={false}
          value={activeGroup?.yAxis.step} onChange={onStepChange} changeOnWheel={true}
          parser={inputIntParser} min={minStep} max={maxStep} step={1} precision={0}
        />
      </Flex>
      <IconRow justify={'center'}>
        <IconRowButton
          icon={yAxisIcon} alt={'y-axis'} title={t('carat.group.y-axis')}
          active={settings.show} onClick={onShowChange}
        />
        <IconRowButton
          icon={yAxisDepthMarksIcon} alt={'y-axis-depth'} title={t('carat.group.y-axis-depth')}
          active={settings.depthMarks} onClick={onShowDepthMarksChange}
        />
        <IconRowButton
          icon={yAxisAbsMarksIcon} alt={'y-axis-abs'} title={t('carat.group.y-axis-abs')}
          active={settings.absMarks} onClick={onShowAbsMarksChange} disabled={!track.inclinometry}
        />
        <IconRowButton
          icon={yAxisGridIcon} alt={'y-axis-grid'} title={t('carat.group.y-axis-grid')}
          active={settings.grid} onClick={onShowGridChange}
        />
      </IconRow>
    </div>
  );
};
