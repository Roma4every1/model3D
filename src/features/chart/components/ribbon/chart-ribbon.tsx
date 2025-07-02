import { useTranslation } from 'react-i18next';
import { useChartState } from '../../store/chart.store';
import { MenuSkeleton } from 'shared/ui';

import './chart-ribbon.scss';
import { ChartSectionGlobal } from './section-global';
import { ChartSectionProperty } from './section-property';
import { ChartSectionAxis } from './section-axis';
import { ChartSectionExport } from './section-export';


export const ChartRibbon = ({id, parentID}: FormRibbonProps) => {
  const { t } = useTranslation();
  const state = useChartState(id);

  if (!state) {
    const template = ['179px', '158px', '329px', '87px'];
    return <MenuSkeleton template={template}/>;
  }
  return (
    <div className={'menu'}>
      <ChartSectionGlobal state={state} t={t}/>
      <ChartSectionProperty state={state} t={t}/>
      <ChartSectionAxis state={state} t={t}/>
      <ChartSectionExport state={state} parentID={parentID} t={t}/>
    </div>
  );
};
