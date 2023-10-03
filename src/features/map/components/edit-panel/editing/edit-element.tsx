import { TFunction, useTranslation } from 'react-i18next';
import { MapMode, elementEditModes } from '../../../lib/constants.ts';

import addBetween from 'assets/images/map/add-between.png';
import handIcon from 'assets/images/map/hand.png';
import movePoint from 'assets/images/map/move-point.png';
import addEnd from 'assets/images/map/add-end.png';
import deletePoint from 'assets/images/map/delete-point.png';
import moveIcon from 'assets/images/map/move.png';
import rotateIcon from 'assets/images/map/rotate.png';


interface EditElementProps {
  stage: IMapStage;
}
interface EditItemProps {
  ownMode: MapMode;
  selected: boolean;
  t: TFunction;
  action: () => void;
}


/** Иконки режимов редактирования. */
const mapEditIconsDict: Record<number, string> = {
  10: handIcon,    // MapModes.MOVE_MAP
  11: moveIcon,    // MapModes.MOVE
  12: rotateIcon,  // MapModes.ROTATE
  21: movePoint,   // MapModes.MOVE_POINT
  22: addEnd,      // MapModes.ADD_END
  23: addBetween,  // MapModes.ADD_BETWEEN
  24: deletePoint, // MapModes.DELETE_POINT
};
/** Подсказки режимов редактирования. */
const translationDict: Record<number, string> = {
  10: 'map.editing.move-map',     // MapModes.MOVE_MAP
  11: 'map.editing.move',         // MapModes.MOVE
  12: 'map.editing.rotate',       // MapModes.ROTATE
  21: 'map.editing.move-point',   // MapModes.MOVE_POINT
  22: 'map.editing.add-end',      // MapModes.ADD_END
  23: 'map.editing.add-between',  // MapModes.ADD_BETWEEN
  24: 'map.editing.delete-point', // MapModes.DELETE_POINT
};

export const EditElement = ({stage}: EditElementProps) => {
  const { t } = useTranslation();
  const mode = stage.getMode();
  const type = stage.getActiveElement().type;

  const toButton = (ownMode: MapMode) => {
    const isSameMode = mode === ownMode;
    const action = () => {
      if (!isSameMode) stage.setMode(ownMode);
      if (mode < MapMode.MOVE_MAP) stage.startEditing();
    };
    return <EditItem key={ownMode} ownMode={ownMode} selected={isSameMode} t={t} action={action}/>;
  };
  return <div>{elementEditModes[type].map(toButton)}</div>;
};

const EditItem = ({ownMode, selected, t, action}: EditItemProps) => {
  const title = t(translationDict[ownMode]);
  const className = 'map-panel-button' + (selected ? ' selected' : '');

  return (
    <button className={className} onClick={action}>
      <img src={mapEditIconsDict[ownMode]} alt={title} title={title}/>
    </button>
  );
};
