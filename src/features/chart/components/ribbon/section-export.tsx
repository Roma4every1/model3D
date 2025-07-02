import type { TFunction } from 'react-i18next';
import type { ChartState } from '../../lib/chart.types';
import { saveAs } from '@progress/kendo-file-saver';
import { MenuSection, BigButton } from 'shared/ui';
import { exportChartToExcel } from '../../store/chart.thunks';
import pngExportIcon from 'assets/chart/download-png.png';
import excelExportIcon from 'assets/chart/download-excel.png';


interface ChartSectionExportProps {
  state: ChartState;
  parentID: ClientID;
  t: TFunction;
}

export const ChartSectionExport = ({state, parentID, t}: ChartSectionExportProps) => {
  const exportToPng = async () => {
    const png = await state.getPng();
    if (png) saveAs(png, 'chart.png');
  };
  const exportToExcel = () => {
    exportChartToExcel(state.id, parentID).then();
  };

  return (
    <MenuSection header={t('chart.panel.section-export')} className={'big-buttons'}>
      <BigButton
        text={t('chart.panel.export-png')} icon={pngExportIcon}
        style={{width: 70}} onClick={exportToPng}
      />
      <BigButton
        text={t('chart.panel.export-excel')} icon={excelExportIcon}
        style={{width: 70}} onClick={exportToExcel}
      />
    </MenuSection>
  );
};
