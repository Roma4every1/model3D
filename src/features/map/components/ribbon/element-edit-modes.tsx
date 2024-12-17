import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { startMapEditing } from '../../store/map-edit.actions';
import { mapEditConfig } from '../../lib/constants';

import handIcon from 'assets/map/hand.png';
import moveIcon from 'assets/map/move.png';
import rotateIcon from 'assets/map/rotate.png';
import movePointIcon from 'assets/map/move-point.png';
import appendPointIcon from 'assets/map/add-end.png';
import insertPointIcon from 'assets/map/add-between.png';
import removePointIcon from 'assets/map/delete-point.png';


interface ElementEditModesProps {
  id: FormID;
  stage: IMapStage;
}

const editModeIconDict = {
  'default': handIcon,
  'element-drag': moveIcon,
  'element-rotate': rotateIcon,
  'line-move-point': movePointIcon,
  'line-append-point': appendPointIcon,
  'line-insert-point': insertPointIcon,
  'line-remove-point': removePointIcon,
};

export const ElementEditModes = ({id, stage}: ElementEditModesProps) => {
  const { t } = useTranslation();
  const mode = stage.getMode();

  const toButton = (ownMode: MapModeID) => {
    const title = t('map.editing.' + ownMode);
    const className = clsx('map-panel-button', mode === ownMode && 'selected');

    const action = () => {
      if (mode !== ownMode) stage.setMode(ownMode);
      if (mode === 'element-select') startMapEditing(id);
    };

    return (
      <button key={ownMode} className={className} onClick={action}>
        <img src={editModeIconDict[ownMode]} alt={ownMode} title={title}/>
      </button>
    );
  };

  const modes = mapEditConfig[stage.getActiveElement().type].editModes;
  return <div>{modes.map(toButton)}</div>;
};
