import { useTranslation } from 'react-i18next';
import { useProfileState } from '../store/profile.store';
import { saveFile } from 'shared/lib';
import { getFullViewport } from 'features/map/lib/map-utils';
import { profileToExcel } from '../lib/excel-export';
import { MenuSkeleton, MenuSection, BigButton } from 'shared/ui';
import selectAllIcon from 'assets/map/select-all.png';
import pngExportIcon from 'assets/profile/export-png.svg';
import excelExportIcon from 'assets/profile/export-excel.svg';


export const ProfileRibbon = ({id}: FormRibbonProps) => {
  const { t } = useTranslation();
  const state = useProfileState(id);

  if (!state) {
    return <MenuSkeleton template={['90px', '150px']}/>;
  }
  const stage = state.stage;
  const disabled = !stage.getMapData() || state.loading.percentage < 100;

  const toFullViewPort = () => {
    const canvas = stage.getCanvas();
    const mapData = stage.getMapData();
    if (!canvas || !mapData) return;
    const viewport = getFullViewport(canvas, mapData.layers);
    viewport.scale *= 1.25;
    stage.render(viewport);
  };

  const exportToPng = () => {
    state.canvas.toBlob((data: Blob) => {
      if (data) saveFile('profile.png', data);
    }, 'image/png', 1);
  };
  const exportToExcel = () => {
    const save = (data: Blob) => saveFile('profile.xlsx', data);
    profileToExcel(state.canvas).then(save).catch();
  };

  return (
    <div className={'menu'} style={{display: 'grid', gridTemplateColumns: '90px 150px'}}>
      <MenuSection header={t('profile.navigation')} className={'big-buttons'}>
        <BigButton
          text={t('profile.show-all')} icon={selectAllIcon} style={{width: 90}}
          onClick={toFullViewPort} disabled={disabled}
        />
      </MenuSection>
      <MenuSection header={t('profile.export')} className={'big-buttons'}>
        <BigButton
          text={t('profile.export-png')} icon={pngExportIcon}
          onClick={exportToPng} disabled={disabled}
        />
        <BigButton
          text={t('profile.export-excel')} icon={excelExportIcon}
          onClick={exportToExcel} disabled={disabled}
        />
      </MenuSection>
    </div>
  );
};
