import { useDispatch } from 'react-redux';
import { TFunction, useTranslation } from 'react-i18next';
import { MapMode } from '../../../lib/constants.ts';
import { startMapEditing, setEditMode } from '../../../store/map.actions';

import addBetween from 'assets/images/map/add-between.png';
import handIcon from 'assets/images/map/hand.png';
import movePoint from 'assets/images/map/move-point.png';
import addEnd from 'assets/images/map/add-end.png';
import deletePoint from 'assets/images/map/delete-point.png';
import moveIcon from 'assets/images/map/move.png';
import rotateIcon from 'assets/images/map/rotate.png';


interface EditElementProps {
  type: string;
  mode: MapMode;
  formID: FormID;
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

/** Доступные режимы редактирования для выбранных элементов карты. */
const elementsModes: {[key: string]: MapMode[]} = {
  'polyline': [
    MapMode.MOVE_MAP, MapMode.MOVE_POINT,
    MapMode.ADD_END, MapMode.ADD_BETWEEN, MapMode.DELETE_POINT
  ],
  'label': [MapMode.MOVE_MAP, MapMode.MOVE, MapMode.ROTATE],
  'sign': [MapMode.MOVE_MAP, MapMode.MOVE],
};

export const EditElement = ({type, mode, formID}: EditElementProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const buttons = (elementsModes[type] || []).map((ownMode) => {
    const isSameMode = mode === ownMode;
    const action = () => {
      if (mode < MapMode.MOVE_MAP) dispatch(startMapEditing(formID));
      dispatch(setEditMode(formID, isSameMode ? MapMode.NONE : ownMode));
    }
    return <EditItem key={ownMode} ownMode={ownMode} selected={isSameMode} t={t} action={action}/>;
  });
  return <div>{buttons}</div>;
};

const EditItem = ({ownMode, selected, t, action}: EditItemProps) => {
  const src = mapEditIconsDict[ownMode], alt = translationDict[ownMode];
  const className = 'map-panel-button' + (selected ? ' selected' : '');
  const title = t(alt);

  return (
    <button className={className} onClick={action}>
      <img src={src} alt={title} title={title}/>
    </button>
  );
};
