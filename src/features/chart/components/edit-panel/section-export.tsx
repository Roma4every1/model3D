import type { TFunction } from 'react-i18next';
import type { ChartState } from '../../lib/chart.types';
import { saveAs } from '@progress/kendo-file-saver';
import { MenuSection, BigButton } from 'shared/ui';
import downloadIcon from 'assets/chart/download-png.png';


interface ChartSectionExportProps {
  state: ChartState;
  t: TFunction;
}

export const ChartSectionExport = ({state, t}: ChartSectionExportProps) => {
  const exportChart = async () => {
    const png = await state.getPng();
    if (png) saveAs(png, 'chart.png');
  };

  return (
    <MenuSection header={t('chart.panel.section-export')} className={'big-buttons'}>
      <BigButton
        text={t('chart.panel.export-png')} icon={downloadIcon}
        style={{width: 85}} onClick={exportChart}
      />
    </MenuSection>
  );
};
